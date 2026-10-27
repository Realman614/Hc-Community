import { initializeApp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";
import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    sendEmailVerification,
    sendPasswordResetEmail,
    onAuthStateChanged,
    signOut,
    reload
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";
import {
    getFirestore,
    collection,
    doc,
    getDoc,
    getDocs,
    updateDoc,
    deleteDoc,
    writeBatch,
    runTransaction,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyDf7_iseJvU9Y2gcmivPL4NwsJFp0QLSZI",
    authDomain: "hc-community-c3e04.firebaseapp.com",
    projectId: "hc-community-c3e04",
    storageBucket: "hc-community-c3e04.firebasestorage.app",
    messagingSenderId: "1035690775399",
    appId: "1:1035690775399:web:039e06b22688b534a95c2"
};

const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);

const DEVELOPER_UID = "QTTZIpXc36Pdc6Tf5urjHcD84dV2";

const BUILT_IN_COMMUNITY_IDS = new Set([
    "basketball", "fencing", "football", "math", "science",
    "coding", "art", "music", "photography"
]);

const authModal = document.getElementById("authModal");
const authModalTitle = document.getElementById("authModalTitle");
const authModalCopy = document.getElementById("authModalCopy");
const authForm = document.getElementById("authForm");
const authEmail = document.getElementById("authEmail");
const authPassword = document.getElementById("authPassword");
const authConfirmPassword = document.getElementById("authConfirmPassword");
const confirmPasswordField = document.getElementById("confirmPasswordField");
const authSubmitButton = document.getElementById("authSubmitButton");
const authMessage = document.getElementById("authMessage");
const forgotPasswordButton = document.getElementById("forgotPasswordButton");
const switchAuthModeButton = document.getElementById("switchAuthModeButton");
const closeAuthModal = document.getElementById("closeAuthModal");
const openLoginButton = document.getElementById("openLoginButton");
const openSignupButton = document.getElementById("openSignupButton");
const authFormPanel = document.getElementById("authFormPanel");
const verificationPanel = document.getElementById("verificationPanel");
const verificationEmail = document.getElementById("verificationEmail");
const verificationMessage = document.getElementById("verificationMessage");
const checkVerificationButton = document.getElementById("checkVerificationButton");
const resendVerificationButton = document.getElementById("resendVerificationButton");
const verificationSignOutButton = document.getElementById("verificationSignOutButton");
const signOutButton = document.getElementById("signOutButton");
const settingsAccountEmail = document.getElementById("settingsAccountEmail");
const settingsVerificationStatus = document.getElementById("settingsVerificationStatus");
const settingsProfileName = document.getElementById("settingsProfileName");
const settingsProfileUsername = document.getElementById("settingsProfileUsername");

const profileModal = document.getElementById("profileModal");
const profileForm = document.getElementById("profileForm");
const profileRealName = document.getElementById("profileRealName");
const profileUsername = document.getElementById("profileUsername");
const profileGrade = document.getElementById("profileGrade");
const profileClassName = document.getElementById("profileClassName");
const profileMessage = document.getElementById("profileMessage");
const profileSubmitButton = document.getElementById("profileSubmitButton");
const profileSignOutButton = document.getElementById("profileSignOutButton");

let authMode = "login";
let appEnteredForCurrentSession = false;
let currentProfile = null;

function showMessage(element, message, type = "error") {
    if (!element) return;
    element.textContent = message;
    element.classList.remove("hidden", "success");
    if (type === "success") element.classList.add("success");
}

function clearMessage(element) {
    if (!element) return;
    element.textContent = "";
    element.classList.add("hidden");
    element.classList.remove("success");
}

function friendlyAuthError(error) {
    const messages = {
        "auth/email-already-in-use": "An account already exists with this email.",
        "auth/invalid-email": "Please enter a valid email address.",
        "auth/invalid-credential": "The email or password is incorrect.",
        "auth/missing-password": "Please enter your password.",
        "auth/weak-password": "Use a stronger password with at least 6 characters.",
        "auth/too-many-requests": "Too many attempts. Please wait a little and try again.",
        "auth/network-request-failed": "Network error. Check your internet connection and try again.",
        "permission-denied": "Your account does not have permission for this action. Try signing in again or contact the site administrator.",
        "failed-precondition": "Firestore needs an additional setup step before this action can run."
    };

    return messages[error?.code] || error?.message || "Something went wrong. Please try again.";
}

function normalizeUsername(value) {
    return value.trim().toLocaleLowerCase();
}

function validUsername(value) {
    const username = value.trim();
    const characterCount = Array.from(username).length;

    return characterCount >= 1
        && characterCount <= 32
        && username !== "."
        && username !== ".."
        && !username.includes("/")
        && !/[\u0000-\u001F\u007F]/u.test(username);
}

function setAuthMode(mode) {
    authMode = mode;
    const creating = mode === "signup";

    authModalTitle.textContent = creating ? "Create Account" : "Sign In";
    authModalCopy.textContent = creating
        ? "Create your HC-Community account. You will verify your email before entering."
        : "Sign in with your HC-Community account.";
    authSubmitButton.textContent = creating ? "Create Account" : "Sign In";
    switchAuthModeButton.textContent = creating ? "Already have an account? Sign in" : "Create an account";
    confirmPasswordField.classList.toggle("hidden", !creating);
    forgotPasswordButton.classList.toggle("hidden", creating);
    authPassword.autocomplete = creating ? "new-password" : "current-password";
    authConfirmPassword.required = creating;
    clearMessage(authMessage);
}

function openAuth(mode = "login") {
    setAuthMode(mode);
    authFormPanel.classList.remove("hidden");
    verificationPanel.classList.add("hidden");
    authModal.classList.remove("hidden");
    setTimeout(() => authEmail?.focus(), 0);
}

function closeAuth() {
    authModal.classList.add("hidden");
    clearMessage(authMessage);
    clearMessage(verificationMessage);
}

function showVerification(user) {
    authFormPanel.classList.add("hidden");
    verificationPanel.classList.remove("hidden");
    verificationEmail.textContent = user?.email || "your email";
    authModal.classList.remove("hidden");
    clearMessage(verificationMessage);
}

function updateAccountUI(user, profile = currentProfile) {
    if (settingsAccountEmail) settingsAccountEmail.textContent = user?.email || "Signed in";
    if (settingsVerificationStatus) settingsVerificationStatus.textContent = user?.emailVerified ? "Verified" : "Not verified";
    if (settingsProfileName) settingsProfileName.textContent = profile?.realName || "Profile not completed";
    if (settingsProfileUsername) settingsProfileUsername.textContent = profile?.username ? `@${profile.username}` : "";
}

function showProfileSetup(user) {
    closeAuth();
    clearMessage(profileMessage);
    profileModal?.classList.remove("hidden");
    if (profileRealName && !profileRealName.value) {
        profileRealName.value = user?.displayName || "";
    }
    setTimeout(() => profileRealName?.focus(), 0);
}

function isDeveloperIdentity(user = auth.currentUser) {
    return Boolean(user?.emailVerified && user.uid === DEVELOPER_UID);
}

async function getCurrentProfile(user) {
    if (!user?.emailVerified) return null;

    const userRef = doc(db, "users", user.uid);
    const snapshot = await getDoc(userRef);
    if (!snapshot.exists()) return null;

    let profile = snapshot.data();

    // This one verified Firebase UID is the HC-Community developer account.
    // The matching Firestore rule only allows this exact UID to promote its
    // own existing role from student -> developer. No other account can do it.
    if (isDeveloperIdentity(user) && profile.role !== "developer") {
        try {
            await updateDoc(userRef, { role: "developer" });
            profile = { ...profile, role: "developer" };
        } catch (error) {
            console.warn("Developer role promotion is waiting for the updated Firestore rules.", error);
        }
    }

    return profile;
}

async function enterAuthenticatedApp(user, profile) {
    if (!user?.emailVerified || appEnteredForCurrentSession) return;
    appEnteredForCurrentSession = true;
    currentProfile = profile;
    closeAuth();
    profileModal?.classList.add("hidden");
    updateAccountUI(user, profile);
    window.dispatchEvent(new CustomEvent("hc-authenticated", {
        detail: {
            email: user.email, uid: user.uid, profile,
            onFailure: () => { appEnteredForCurrentSession = false; }
        }
    }));
}

async function continueAfterVerification(user) {
    if (!user?.emailVerified) return;

    try {
        // Firestore rules check the email_verified claim in the Firebase ID token.
        // Force-refresh it immediately after verification so the user does not
        // have to sign out and back in before Firestore accepts requests.
        await user.getIdToken(true);

        const profile = await getCurrentProfile(user);
        if (!profile) {
            showProfileSetup(user);
            return;
        }
        await enterAuthenticatedApp(user, profile);
    } catch (error) {
        console.error("Could not load Firestore profile:", error);
        showProfileSetup(user);
        showMessage(profileMessage, friendlyAuthError(error));
    }
}

openLoginButton?.addEventListener("click", () => openAuth("login"));
openSignupButton?.addEventListener("click", () => openAuth("signup"));
closeAuthModal?.addEventListener("click", closeAuth);

switchAuthModeButton?.addEventListener("click", () => {
    setAuthMode(authMode === "login" ? "signup" : "login");
});

authModal?.addEventListener("click", event => {
    if (event.target === authModal) closeAuth();
});

document.addEventListener("keydown", event => {
    if (event.key === "Escape" && !authModal?.classList.contains("hidden")) closeAuth();
});

authForm?.addEventListener("submit", async event => {
    event.preventDefault();
    clearMessage(authMessage);

    const email = authEmail.value.trim();
    const password = authPassword.value;
    const confirmPassword = authConfirmPassword.value;

    if (authMode === "signup" && password !== confirmPassword) {
        showMessage(authMessage, "The passwords do not match.");
        return;
    }

    authSubmitButton.disabled = true;
    authSubmitButton.textContent = authMode === "signup" ? "Creating…" : "Signing in…";

    try {
        if (authMode === "signup") {
            const credential = await createUserWithEmailAndPassword(auth, email, password);
            await sendEmailVerification(credential.user);
            showVerification(credential.user);
            showMessage(verificationMessage, "Verification email sent. Check your inbox and spam folder.", "success");
        } else {
            const credential = await signInWithEmailAndPassword(auth, email, password);
            await reload(credential.user);

            if (!credential.user.emailVerified) {
                showVerification(credential.user);
                return;
            }

            await continueAfterVerification(credential.user);
        }
    } catch (error) {
        showMessage(authMessage, friendlyAuthError(error));
    } finally {
        authSubmitButton.disabled = false;
        authSubmitButton.textContent = authMode === "signup" ? "Create Account" : "Sign In";
    }
});

forgotPasswordButton?.addEventListener("click", async () => {
    clearMessage(authMessage);
    const email = authEmail.value.trim();

    if (!email) {
        showMessage(authMessage, "Enter your email first, then click Forgot password.");
        authEmail.focus();
        return;
    }

    try {
        await sendPasswordResetEmail(auth, email);
        showMessage(authMessage, "Password reset email sent. Check your inbox.", "success");
    } catch (error) {
        showMessage(authMessage, friendlyAuthError(error));
    }
});

checkVerificationButton?.addEventListener("click", async () => {
    const user = auth.currentUser;
    if (!user) {
        openAuth("login");
        return;
    }

    checkVerificationButton.disabled = true;
    checkVerificationButton.textContent = "Checking…";
    clearMessage(verificationMessage);

    try {
        await reload(user);
        if (user.emailVerified) {
            showMessage(verificationMessage, "Email verified. Setting up your HC-Community profile…", "success");
            await continueAfterVerification(user);
        } else {
            showMessage(verificationMessage, "Not verified yet. Open the link in your email, then try again.");
        }
    } catch (error) {
        showMessage(verificationMessage, friendlyAuthError(error));
    } finally {
        checkVerificationButton.disabled = false;
        checkVerificationButton.textContent = "I Verified My Email";
    }
});

resendVerificationButton?.addEventListener("click", async () => {
    const user = auth.currentUser;
    if (!user) return openAuth("login");

    clearMessage(verificationMessage);
    try {
        await sendEmailVerification(user);
        showMessage(verificationMessage, "A new verification email was sent.", "success");
    } catch (error) {
        showMessage(verificationMessage, friendlyAuthError(error));
    }
});

profileForm?.addEventListener("submit", async event => {
    event.preventDefault();
    clearMessage(profileMessage);

    const user = auth.currentUser;
    if (!user?.emailVerified) {
        showMessage(profileMessage, "Please verify your email first.");
        return;
    }

    const realName = profileRealName.value.trim();
    const usernameInput = profileUsername.value.trim();
    const usernameNormalized = normalizeUsername(usernameInput);
    const username = usernameInput;
    const grade = profileGrade.value;
    const className = profileClassName.value.trim();

    if (realName.length < 2 || realName.length > 50) {
        showMessage(profileMessage, "Real name must be between 2 and 50 characters.");
        return;
    }

    if (!validUsername(usernameInput)) {
        showMessage(profileMessage, "Username can be 1–32 characters. Letters, symbols, spaces and emoji are welcome; / is the only reserved character.");
        return;
    }

    if (!grade || className.length < 1 || className.length > 30) {
        showMessage(profileMessage, "Choose your grade and enter your class.");
        return;
    }

    profileSubmitButton.disabled = true;
    profileSubmitButton.textContent = "Creating profile…";

    try {
        const userRef = doc(db, "users", user.uid);
        const usernameRef = doc(db, "usernames", usernameNormalized);

        const [userSnapshot, usernameSnapshot] = await Promise.all([
            getDoc(userRef),
            getDoc(usernameRef)
        ]);

        if (userSnapshot.exists()) {
            currentProfile = userSnapshot.data();
            await enterAuthenticatedApp(user, currentProfile);
            return;
        }

        if (usernameSnapshot.exists()) {
            showMessage(profileMessage, "That username is already taken. Try another one.");
            return;
        }

        const profile = {
            uid: user.uid,
            email: user.email,
            realName,
            username,
            usernameNormalized,
            grade,
            className,
            role: "student",
            createdAt: serverTimestamp()
        };

        const batch = writeBatch(db);
        batch.set(userRef, profile);
        batch.set(usernameRef, {
            uid: user.uid,
            username,
            usernameNormalized,
            createdAt: serverTimestamp()
        });
        await batch.commit();

        const savedProfile = {
            ...profile,
            createdAt: new Date()
        };
        await enterAuthenticatedApp(user, savedProfile);
    } catch (error) {
        console.error("Profile creation failed:", error);
        const message = error?.code === "permission-denied"
            ? "Profile could not be created. The username may have just been taken, or your account may not have permission. Try another username or contact the site administrator."
            : friendlyAuthError(error);
        showMessage(profileMessage, message);
    } finally {
        profileSubmitButton.disabled = false;
        profileSubmitButton.textContent = "Finish Profile";
    }
});

profileSignOutButton?.addEventListener("click", async () => {
    await signOut(auth);
    window.location.reload();
});

verificationSignOutButton?.addEventListener("click", async () => {
    await signOut(auth);
    openAuth("login");
});

signOutButton?.addEventListener("click", async () => {
    try {
        await signOut(auth);
        window.location.reload();
    } catch (error) {
        window.alert(friendlyAuthError(error));
    }
});

function requireVerifiedUser() {
    const user = auth.currentUser;
    if (!user?.emailVerified) throw new Error("You must be signed in with a verified email.");
    return user;
}

async function getCommunityState(defaultCommunities) {
    const user = requireVerifiedUser();

    const membershipsRef = collection(db, "users", user.uid, "memberships");
    const [communitySnapshot, statsSnapshot, membershipSnapshot] = await Promise.all([
        getDocs(collection(db, "communities")),
        getDocs(collection(db, "communityStats")),
        getDocs(membershipsRef)
    ]);

    const stats = new Map();
    statsSnapshot.forEach(snapshot => {
        const data = snapshot.data();
        stats.set(snapshot.id, Number.isInteger(data.memberCount) ? data.memberCount : 0);
    });

    const builtIn = defaultCommunities.map(community => ({
        ...community,
        members: stats.get(community.id) || 0,
        isBuiltIn: true
    }));

    const custom = communitySnapshot.docs.map(snapshot => {
        const data = snapshot.data();
        return {
            id: snapshot.id,
            name: data.name,
            icon: data.icon,
            category: data.category,
            description: data.description,
            channels: Array.isArray(data.channels) ? data.channels : [],
            ownerId: data.ownerId,
            members: stats.get(snapshot.id) || 0,
            isBuiltIn: false
        };
    });

    const joinedCommunities = membershipSnapshot.docs.map(snapshot => snapshot.id);
    return { communities: [...builtIn, ...custom], joinedCommunities };
}

async function joinCommunityInFirestore(communityId) {
    const user = requireVerifiedUser();
    const membershipRef = doc(db, "users", user.uid, "memberships", communityId);
    const statsRef = doc(db, "communityStats", communityId);
    const isBuiltIn = BUILT_IN_COMMUNITY_IDS.has(communityId);
    const communityRef = isBuiltIn ? null : doc(db, "communities", communityId);

    return runTransaction(db, async transaction => {
        // Built-in communities (Basketball, Math, etc.) do not need a
        // community-document read. That removes one network read from the
        // most common Join path.
        const membershipSnapshot = await transaction.get(membershipRef);
        if (membershipSnapshot.exists()) {
            const statsSnapshot = await transaction.get(statsRef);
            return Number(statsSnapshot.data()?.memberCount) || 0;
        }

        const statsSnapshot = await transaction.get(statsRef);

        if (!isBuiltIn) {
            const communitySnapshot = await transaction.get(communityRef);
            if (!communitySnapshot.exists()) {
                throw new Error("That community no longer exists.");
            }
        }

        const oldCount = statsSnapshot.exists()
            ? Number(statsSnapshot.data().memberCount) || 0
            : 0;
        const nextCount = Math.max(0, oldCount) + 1;

        transaction.set(membershipRef, {
            communityId,
            role: "member",
            joinedAt: serverTimestamp()
        });

        if (statsSnapshot.exists()) {
            transaction.update(statsRef, {
                memberCount: nextCount,
                updatedAt: serverTimestamp()
            });
        } else {
            transaction.set(statsRef, {
                memberCount: 1,
                updatedAt: serverTimestamp()
            });
        }

        return nextCount;
    });
}

async function leaveCommunityInFirestore(communityId) {
    const user = requireVerifiedUser();
    const membershipRef = doc(db, "users", user.uid, "memberships", communityId);
    const statsRef = doc(db, "communityStats", communityId);

    await runTransaction(db, async transaction => {
        const [membershipSnapshot, statsSnapshot] = await Promise.all([
            transaction.get(membershipRef),
            transaction.get(statsRef)
        ]);

        if (!membershipSnapshot.exists()) return;
        if (membershipSnapshot.data().role === "owner") {
            throw new Error("The community owner cannot leave yet. Community transfer/delete comes in the admin phase.");
        }
        if (!statsSnapshot.exists()) throw new Error("Community member count is missing.");

        const oldCount = Number(statsSnapshot.data().memberCount) || 0;
        transaction.delete(membershipRef);
        transaction.update(statsRef, {
            memberCount: Math.max(0, oldCount - 1),
            updatedAt: serverTimestamp()
        });
    });
}

async function createCommunityInFirestore(input) {
    const user = requireVerifiedUser();
    const count = value => Array.from(String(value || "")).length;
    if (count(input.name) < 2 || count(input.name) > 30
        || count(input.icon) < 1 || count(input.icon) > 8
        || count(input.description) < 1 || count(input.description) > 180
        || !["SPORTS", "ACADEMIC", "TECHNOLOGY", "CREATIVE", "OTHER"].includes(input.category)) {
        throw new Error("Use a community name of 2–30 characters, an icon of 1–8 characters, and a description of 1–180 characters.");
    }
    const communityRef = doc(collection(db, "communities"));
    const communityId = communityRef.id;
    const statsRef = doc(db, "communityStats", communityId);
    const membershipRef = doc(db, "users", user.uid, "memberships", communityId);

    const channels = [
        { id: "general", name: "general", description: `General ${input.name} conversation.` },
        { id: "announcements", name: "announcements", description: `Updates and announcements from ${input.name}.` },
        { id: "resources", name: "resources", description: `Useful resources for ${input.name}.` }
    ];

    const batch = writeBatch(db);
    batch.set(communityRef, {
        name: input.name,
        icon: input.icon,
        category: input.category,
        description: input.description,
        channels,
        ownerId: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
    });
    batch.set(statsRef, {
        memberCount: 1,
        updatedAt: serverTimestamp()
    });
    batch.set(membershipRef, {
        communityId,
        role: "owner",
        joinedAt: serverTimestamp()
    });
    await batch.commit();

    return communityId;
}


function timestampToMillis(value) {
    if (!value) return Date.now();
    if (typeof value.toMillis === "function") return value.toMillis();
    if (value instanceof Date) return value.getTime();
    if (typeof value === "number") return value;
    return Date.now();
}

async function getPostState() {
    const user = requireVerifiedUser();
    const postSnapshot = await getDocs(collection(db, "posts"));

    const visiblePostDocs = postSnapshot.docs.filter(snapshot => {
        const data = snapshot.data();
        return data.deleted !== true;
    });

    const posts = await Promise.all(
        visiblePostDocs.map(async snapshot => {
            const data = snapshot.data();
            const likesRef = collection(db, "posts", snapshot.id, "likes");
            const repliesRef = collection(db, "posts", snapshot.id, "replies");

            const [likesSnapshot, repliesSnapshot] = await Promise.all([
                getDocs(likesRef),
                getDocs(repliesRef)
            ]);

            const replies = repliesSnapshot.docs
                .map(replySnapshot => {
                    const reply = replySnapshot.data();
                    return {
                        id: replySnapshot.id,
                        authorId: reply.authorId,
                        author: reply.authorName,
                        authorUsername: reply.authorUsername || "",
                        content: reply.content,
                        timestamp: timestampToMillis(reply.createdAt)
                    };
                })
                .sort((a, b) => a.timestamp - b.timestamp);

            return {
                id: snapshot.id,
                communityId: data.communityId,
                channelId: data.channelId,
                authorId: data.authorId,
                author: data.authorName,
                authorUsername: data.authorUsername || "",
                avatar: data.avatar || (data.authorName || "?").charAt(0).toUpperCase(),
                content: data.content,
                timestamp: timestampToMillis(data.createdAt),
                likes: likesSnapshot.size,
                liked: likesSnapshot.docs.some(likeSnapshot => likeSnapshot.id === user.uid),
                replies
            };
        })
    );

    return posts.sort((a, b) => b.timestamp - a.timestamp);
}

async function createPostInFirestore(input) {
    const user = requireVerifiedUser();
    if (!currentProfile) throw new Error("Your profile is not ready.");

    const content = String(input.content || "").trim();
    const communityId = String(input.communityId || "");
    const channelId = String(input.channelId || "");

    if (!communityId || !channelId || content.length < 1 || content.length > 1000) {
        throw new Error("Post content must be between 1 and 1000 characters.");
    }

    const postRef = doc(collection(db, "posts"));
    const batch = writeBatch(db);
    batch.set(postRef, {
        communityId,
        channelId,
        authorId: user.uid,
        authorName: currentProfile.realName,
        authorUsername: currentProfile.username,
        avatar: (currentProfile.realName || currentProfile.username || "?").charAt(0).toUpperCase(),
        content,
        createdAt: serverTimestamp(),
        deleted: false
    });
    await batch.commit();
    return postRef.id;
}

async function togglePostLikeInFirestore(postId) {
    const user = requireVerifiedUser();
    const likeRef = doc(db, "posts", postId, "likes", user.uid);
    const likeSnapshot = await getDoc(likeRef);
    const batch = writeBatch(db);

    if (likeSnapshot.exists()) {
        batch.delete(likeRef);
    } else {
        batch.set(likeRef, {
            uid: user.uid,
            createdAt: serverTimestamp()
        });
    }

    await batch.commit();
}

async function addReplyInFirestore(postId, contentInput) {
    const user = requireVerifiedUser();
    if (!currentProfile) throw new Error("Your profile is not ready.");

    const content = String(contentInput || "").trim();
    if (content.length < 1 || content.length > 300) {
        throw new Error("Reply must be between 1 and 300 characters.");
    }

    const replyRef = doc(collection(db, "posts", postId, "replies"));
    const batch = writeBatch(db);
    batch.set(replyRef, {
        authorId: user.uid,
        authorName: currentProfile.realName,
        authorUsername: currentProfile.username,
        content,
        createdAt: serverTimestamp()
    });
    await batch.commit();
    return replyRef.id;
}

async function deleteReplyInFirestore(postId, replyId) {
    const user = requireVerifiedUser();
    if (!isDeveloperIdentity(user)) {
        throw new Error("Developer access is required to remove another user's reply.");
    }

    const replyRef = doc(db, "posts", postId, "replies", replyId);
    await deleteDoc(replyRef);
}

async function deletePostInFirestore(postId) {
    const user = requireVerifiedUser();
    const postRef = doc(db, "posts", postId);

    await runTransaction(db, async transaction => {
        const postSnapshot = await transaction.get(postRef);
        if (!postSnapshot.exists()) return;

        const data = postSnapshot.data();
        if (data.authorId !== user.uid && !isDeveloperIdentity(user)) {
            throw new Error("You can only delete your own posts.");
        }

        transaction.update(postRef, {
            deleted: true,
            deletedAt: serverTimestamp()
        });
    });
}

const publicProfileCache = new Map();

async function getPublicProfile(uid) {
    if (!uid || typeof uid !== "string") return null;
    if (publicProfileCache.has(uid)) return publicProfileCache.get(uid);

    if (auth.currentUser?.uid === uid && currentProfile) {
        const ownProfile = {
            uid,
            realName: currentProfile.realName || "",
            username: currentProfile.username || "",
            bio: currentProfile.bio || "",
            avatarUrl: currentProfile.avatarUrl || "",
            bannerUrl: currentProfile.bannerUrl || "",
            isDeveloper: isDeveloperIdentity(auth.currentUser),
            moderatorCommunityIds: Array.isArray(currentProfile.moderatorCommunityIds) ? currentProfile.moderatorCommunityIds : [],
            profileCosmetics: currentProfile.profileCosmetics || {}
        };
        publicProfileCache.set(uid, ownProfile);
        return ownProfile;
    }

    try {
        const snapshot = await getDoc(doc(db, "users", uid));
        if (!snapshot.exists()) return null;
        const data = snapshot.data();
        const publicProfile = {
            uid,
            realName: String(data.realName || ""),
            username: String(data.username || ""),
            bio: String(data.bio || ""),
            avatarUrl: typeof data.avatarUrl === "string" ? data.avatarUrl : "",
            bannerUrl: typeof data.bannerUrl === "string" ? data.bannerUrl : "",
            isDeveloper: uid === DEVELOPER_UID,
            moderatorCommunityIds: Array.isArray(data.moderatorCommunityIds) ? data.moderatorCommunityIds.filter(value => typeof value === "string") : [],
            profileCosmetics: data.profileCosmetics && typeof data.profileCosmetics === "object" ? data.profileCosmetics : {}
        };
        publicProfileCache.set(uid, publicProfile);
        return publicProfile;
    } catch (error) {
        console.warn("Public profile lookup was unavailable.", error);
        return null;
    }
}

async function saveMyProfileCosmetics(cosmetics) {
    const user = requireVerifiedUser();
    if (!currentProfile) throw new Error("Your profile is not ready.");

    const allowedFrames = new Set(["none", "classic"]);
    const clean = {
        avatarFrame: allowedFrames.has(cosmetics?.avatarFrame) ? cosmetics.avatarFrame : "none",
        profileEffect: "none",
        nameplate: "none"
    };

    await updateDoc(doc(db, "users", user.uid), { profileCosmetics: clean });
    currentProfile = { ...currentProfile, profileCosmetics: clean };
    publicProfileCache.set(user.uid, {
        uid: user.uid,
        realName: currentProfile.realName || "",
        username: currentProfile.username || "",
        bio: currentProfile.bio || "",
        avatarUrl: currentProfile.avatarUrl || "",
        bannerUrl: currentProfile.bannerUrl || "",
        isDeveloper: isDeveloperIdentity(user),
        moderatorCommunityIds: Array.isArray(currentProfile.moderatorCommunityIds) ? currentProfile.moderatorCommunityIds : [],
        profileCosmetics: clean
    });
    return clean;
}

window.HCFirebaseData = {
    getCommunityState,
    joinCommunity: joinCommunityInFirestore,
    leaveCommunity: leaveCommunityInFirestore,
    createCommunity: createCommunityInFirestore,
    getPostState,
    createPost: createPostInFirestore,
    togglePostLike: togglePostLikeInFirestore,
    addReply: addReplyInFirestore,
    deleteReply: deleteReplyInFirestore,
    deletePost: deletePostInFirestore,
    getCurrentProfile: () => currentProfile,
    getPublicProfile,
    saveMyProfileCosmetics,
    getCurrentUserId: () => auth.currentUser?.uid || null,
    isDeveloper: () => isDeveloperIdentity() && currentProfile?.role === "developer",
    isDeveloperUid: uid => uid === DEVELOPER_UID
};

window.dispatchEvent(new Event("hc-firebase-ready"));

window.addEventListener("hc-retry-entry", async () => {
    const user = auth.currentUser;
    if (user?.emailVerified) await continueAfterVerification(user);
    else openAuth("login");
});

onAuthStateChanged(auth, async user => {
    appEnteredForCurrentSession = false;
    currentProfile = null;

    if (!user) return;

    try {
        await reload(user);
    } catch (_) {
        // Keep the welcome page usable if a refresh request temporarily fails.
    }

    updateAccountUI(user);

    if (user.emailVerified) {
        await continueAfterVerification(user);
    }
});
