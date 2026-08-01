const fs = require('fs');
let content = fs.readFileSync('src/components/LoginPortal.tsx', 'utf8');

const startStr = `                  // REGISTER FORM & SMTP VERIFICATION SYSTEM`;
const endStr = `                  </div>
                )}
              </div>
            )
          ) : (`;

const startIndex = content.indexOf(startStr);
const endIndex = content.indexOf(endStr, startIndex);

if (startIndex !== -1 && endIndex !== -1) {
  const newContent = content.slice(0, startIndex) + `                  <RegistrationFlow onActivateTenant={onActivateTenant} />\n` + content.slice(endIndex + 19); // 19 is length of "                  </div>\n                )}"
  fs.writeFileSync('src/components/LoginPortal.tsx', newContent);
  console.log('Successfully replaced Register logic.');
} else {
  console.log('Could not find boundaries.');
}
