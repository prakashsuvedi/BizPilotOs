app.post("/api/tenant/login", async (req, res) => {
  const { tenantId, email, password } = req.body;

  if (!tenantId || !email || !password) {
    return res.status(400).json({ error: "Parameters 'tenantId', 'email', and 'password' are required." });
  }

  const isReal = getIsRealAdminReady();
  let matchedTenant = serverMemoryStore.tenants[tenantId];
  if (!matchedTenant && isReal) {
    try {
      const db = getAdminDb();
      const tenantDoc = await db.collection("tenants").doc(tenantId).get();
      if (tenantDoc.exists) {
        matchedTenant = { id: tenantDoc.id, ...tenantDoc.data() };
        serverMemoryStore.tenants[tenantId] = matchedTenant;
      }
    } catch (err: any) {
      console.error(`[Login Tenant Fetch Error]: ${err.message}`);
    }
  }

  if (!matchedTenant) {
    return res.status(404).json({ error: `Selected workspace identifier [${tenantId}] is not active.` });
  }
  if (matchedTenant.status !== "active") {
    return res.status(403).json({ error: `Workspace [${tenantId}] has been suspended.` });
  }

  // Find user inside workspace (from Firestore first if live db is active)
  let user: any = null;
  let authSuccess = false;

  if (isReal) {
    try {
      const db = getAdminDb();
      let userQuery = await db.collection("users")
        .where("tenantId", "==", tenantId)
        .where("email", "==", email.toLowerCase())
        .get();

      if (userQuery.empty) {
        userQuery = await db.collection("users")
          .where("tenantId", "==", tenantId)
          .where("username", "==", email.toLowerCase())
          .get();
      }

      if (!userQuery.empty) {
        const docObj = userQuery.docs[0];
        const dbUser = { id: docObj.id, ...docObj.data() } as any;

        let firebaseApiKey = process.env.VITE_FIREBASE_API_KEY || process.env.FIREBASE_API_KEY;
        if (!firebaseApiKey) {
          try {
            const configPath = path.join(process.cwd(), "firebase-applet-config.json");
            if (fs.existsSync(configPath)) {
              const cfg = JSON.parse(fs.readFileSync(configPath, "utf8"));
              firebaseApiKey = cfg.apiKey;
            }
          } catch (e) {}
        }

        if (firebaseApiKey) {
          try {
            const authUrl = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${firebaseApiKey}`;
            const authResp = await fetch(authUrl, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                email: dbUser.email,
                password: password,
                returnSecureToken: true
              })
            });

            if (authResp.ok) {
              user = dbUser;
              authSuccess = true;
              serverMemoryStore.users[dbUser.uid || dbUser.id] = {
                ...dbUser,
                password
              };
              console.info(`[Auth Success] Authenticated ${dbUser.email} via Firebase Auth REST API.`);
            } else {
              const authErr = await authResp.json();
              console.warn(`[Auth Fail] Firebase Auth REST API failed for ${dbUser.email}:`, authErr.error?.message);

              // Secure fallback: if the password matches the one stored in Firestore (such as during PASSWORD_LOGIN_DISABLED), we permit login
              if (dbUser.password === password) {
                user = dbUser;
                authSuccess = true;
                serverMemoryStore.users[dbUser.uid || dbUser.id] = {
                  ...dbUser,
                  password
                };
                console.info(`[Auth Success] Fallback authenticated ${dbUser.email} via live Firestore password check.`);
              }
            }
          } catch (authFetchErr: any) {
            console.error(`[Auth REST Fetch Error]: ${authFetchErr.message}`);
            // Fallback to local password match on fetch exception
            if (dbUser.password === password) {
              user = dbUser;
              authSuccess = true;
              serverMemoryStore.users[dbUser.uid || dbUser.id] = {
                ...dbUser,
                password
              };
            }
          }
        } else {
          // Standard Firestore check
          if (dbUser.password === password) {
            user = dbUser;
            authSuccess = true;
            serverMemoryStore.users[dbUser.uid || dbUser.id] = {
              ...dbUser,
              password
            };
            console.info(`[Auth Success] Authenticated ${dbUser.email} via live Firestore password check (no API Key).`);
          }
        }
      }
    } catch (dbErr: any) {
      console.error(`[Login Auth DB Error]: ${dbErr.message}`);
    }
  }

  if (!authSuccess) {
    const allUsers: any[] = Object.values(serverMemoryStore.users || {});
    user = allUsers.find(
      (u: any) =>
        u.tenantId === tenantId &&
        (u.email.toLowerCase() === email.toLowerCase() || u.username?.toLowerCase() === email.toLowerCase()) &&
        u.password === password
    );

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials. Please double check password or registered email." });
    }
  }

  res.json({
    success: true,
    role: user.role,
    email: user.email,
    name: user.name,
    username: user.username,
    tenantId: user.tenantId
  });
});
