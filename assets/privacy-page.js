import { cloneDefault, validateSite } from "./model.js";
import { privacyHTML } from "./policy.js";
import { watchSite } from "./cloud.js";
const el = document.getElementById("privacy-content");
el.innerHTML = privacyHTML(cloneDefault());
watchSite(
  (data) => {
    if (data) {
      try {
        el.innerHTML = privacyHTML(validateSite(data));
      } catch {}
    }
  },
  () => {},
).catch(() => {});
