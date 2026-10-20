# HC-Community

Static community website using Firebase email/password authentication and Cloud Firestore. No build or npm installation is required. `index.html` loads `style.css`, `app.js`, and the Firebase SDK module `firebase-auth.js`. `about.html` shares the stylesheet.

## Develop and test

From this checkout, run `python3 -m http.server 8000` and open the site through that local server. Firebase SDK access requires `www.gstatic.com`; live authentication and Firestore additionally require Google's Firebase endpoints. Use an existing verified test account to exercise live features. Avoid `file://` because ES modules need HTTP serving.

Run `node --test tests/*.test.cjs`, `node --check app.js`, and `node --input-type=module --check < firebase-auth.js` (Node 18 or newer).

Manual checks: sign in, verify Settings shows account/profile details, join a built-in community, create a valid custom community, post, like/unlike, reply, delete your own post, change themes, and sign out. Confirm persisted data after reload. To check recovery, block Firestore requests during sign-in, restore the connection, then choose **Try again**. Use test content; these actions write to the configured live Firebase project.

## GitHub Pages

In the repository's **Settings → Pages**, choose **Deploy from a branch**, then **main** and **/(root)**. The expected address is `https://realman614.github.io/Hc-Community/`; it is live only after GitHub confirms deployment. `.nojekyll` enables direct static serving. Asset paths support the repository subdirectory.

In Firebase Console → Authentication → Settings → Authorized domains, confirm `realman614.github.io` is allowed for this site. Add any future custom hostname there as well. Firebase rules remain managed separately in Firebase Console; this repository does not deploy or change them.

For a school domain, ask its administrator to connect a subdomain such as `hc-community.dipont.com` using GitHub Pages custom-domain settings and DNS. Publishing at `dipont.com/Hc-Community` requires the existing school web server or reverse proxy to serve that path; DNS alone cannot route a URL path. Do not add a CNAME file until a domain you control has been agreed and configured.

## Current limitations

Events, notifications, and mentions are demo data. Liquid Glass CSS references an optical engine not included in the supplied source. Post loading currently reads all posts, likes, and replies; pagination is a future improvement. Published Firestore rules were reviewed separately and were not modified. Public hosting makes the landing site accessible; application data still requires a verified account and profile.

The initial Git commit preserves the uploaded application before fixes. Original upload archives are also retained in the onboarding workspace. No credentials beyond the normal public Firebase web configuration belong in this repository.
