/* HC-Com profile cards and cosmetics shop.
   Premium items are preview-only until a trusted checkout is configured. */
(() => {
    const byId = id => document.getElementById(id);
    const profileModal = byId("hcProfileViewModal");
    const shopModal = byId("hcCosmeticsShopModal");
    const profileAvatar = byId("hcProfileAvatar");
    const profileAvatarWrap = byId("hcProfileAvatarWrap");
    const profileBanner = byId("hcProfileBanner");
    const profileName = byId("hcProfileDisplayName");
    const profileHandle = byId("hcProfileHandle");
    const profileBadges = byId("hcProfileBadges");
    const profileBio = byId("hcProfileBio");
    const profileNameplate = byId("hcProfileNameplate");
    const profileMeta = byId("hcProfileMeta");
    const customizeButton = byId("hcOpenShopFromProfile");
    const shopPreviewAvatar = byId("hcShopPreviewAvatar");
    const shopPreviewName = byId("hcShopPreviewName");
    const shopNotice = byId("hcShopNotice");
    const localPreview = new Map();
    const lookupCache = new Map();
    let activeProfile = null;
    let activeContext = { communityId: "", communityName: "" };
    let activePreview = "classic-frame";

    function safeInitial(name) {
        return Array.from(String(name || "HC").trim())[0]?.toUpperCase() || "H";
    }

    function setNotice(message, tone = "") {
        if (!shopNotice) return;
        shopNotice.textContent = message;
        if (tone) shopNotice.dataset.tone = tone;
        else delete shopNotice.dataset.tone;
    }

    function getLocalCosmetics(uid) {
        if (!uid) return {};
        if (localPreview.has(uid)) return localPreview.get(uid);
        try {
            const value = JSON.parse(localStorage.getItem("hc-profile-preview-" + uid) || "{}");
            localPreview.set(uid, value && typeof value === "object" ? value : {});
            return localPreview.get(uid);
        } catch (_) {
            return {};
        }
    }

    function storeLocalCosmetics(uid, cosmetics) {
        if (!uid) return;
        localPreview.set(uid, cosmetics);
        try { localStorage.setItem("hc-profile-preview-" + uid, JSON.stringify(cosmetics)); } catch (_) {}
    }

    function getCosmetics(profile) {
        const saved = profile?.profileCosmetics || {};
        const ownUid = window.HCFirebaseData?.getCurrentUserId?.();
        return ownUid && ownUid === profile?.uid
            ? { ...saved, ...getLocalCosmetics(ownUid) }
            : saved;
    }

    function roleBadge(label, type) {
        const badge = document.createElement("span");
        badge.className = "hc-role-badge hc-role-badge--" + type;
        const icon = document.createElement("span");
        icon.className = "hc-role-badge-icon";
        icon.setAttribute("aria-hidden", "true");
        icon.textContent = type === "dev" ? "◆" : "✦";
        const text = document.createElement("span");
        text.textContent = label;
        badge.append(icon, text);
        badge.setAttribute("aria-label", label);
        return badge;
    }

    function validImageUrl(value) {
        try {
            const url = new URL(value, window.location.href);
            return url.protocol === "https:" || url.protocol === "http:";
        } catch (_) {
            return false;
        }
    }

    function setAvatar(el, profile, cosmetics, isLarge = false) {
        if (!el) return;
        const name = profile?.realName || profile?.username || "HC";
        el.textContent = safeInitial(name);
        el.style.backgroundImage = "";
        if (profile?.avatarUrl && validImageUrl(profile.avatarUrl)) {
            el.textContent = "";
            el.style.backgroundImage = "url(" + JSON.stringify(profile.avatarUrl).slice(1, -1) + ")";
        }
        const frame = cosmetics?.avatarFrame || "none";
        if (isLarge && profileAvatarWrap) profileAvatarWrap.dataset.frame = frame;
        if (!isLarge && shopPreviewAvatar) shopPreviewAvatar.dataset.frame = frame;
    }

    function renderProfile(profile, context = {}) {
        if (!profile) return;
        activeProfile = profile;
        activeContext = {
            communityId: context.communityId || "",
            communityName: context.communityName || ""
        };
        const cosmetics = getCosmetics(profile);
        const name = profile.realName || profile.username || "Community member";
        profileName.textContent = name;
        profileHandle.textContent = profile.username ? "@" + profile.username : "HC-Community member";
        profileBio.textContent = profile.bio || "A member of HC-Community.";
        profileMeta.textContent = activeContext.communityName
            ? "Member of " + activeContext.communityName
            : "HC-Community member";
        profileNameplate.dataset.nameplate = cosmetics.nameplate || "none";
        profileBanner.dataset.banner = cosmetics.banner || "default";
        setAvatar(profileAvatar, profile, cosmetics, true);
        profileBadges.replaceChildren();

        if (profile.isDeveloper) profileBadges.appendChild(roleBadge("DEV", "dev"));
        const modIds = Array.isArray(profile.moderatorCommunityIds) ? profile.moderatorCommunityIds : [];
        if (activeContext.communityId && modIds.includes(activeContext.communityId)) {
            profileBadges.appendChild(roleBadge("MOD · " + (activeContext.communityName || "COMMUNITY").toUpperCase(), "mod"));
        } else if (!activeContext.communityId && modIds.length) {
            profileBadges.appendChild(roleBadge("COMMUNITY MOD", "mod"));
        }
        customizeButton.classList.toggle("hidden", profile.uid !== window.HCFirebaseData?.getCurrentUserId?.());
    }

    async function openProfile(uid, context = {}, fallbackName = "") {
        if (!profileModal || !uid) return;
        profileModal.classList.remove("hidden");
        profileModal.setAttribute("aria-hidden", "false");
        profileName.textContent = "Loading profile…";
        profileHandle.textContent = "";
        profileBadges.replaceChildren();
        profileBio.textContent = "";
        profileMeta.textContent = context.communityName ? "Viewing from " + context.communityName : "HC-Community";
        try {
            const profile = await window.HCFirebaseData?.getPublicProfile?.(uid);
            if (profile) renderProfile(profile, context);
            else {
                const fallback = { uid, realName: fallbackName || "Community member", username: "", bio: "", isDeveloper: window.HCFirebaseData?.isDeveloperUid?.(uid) === true, moderatorCommunityIds: [], profileCosmetics: {} };
                renderProfile(fallback, context);
                profileBio.textContent = "Profile details are not available right now.";
            }
        } catch (_) {
            profileName.textContent = fallbackName || "Community member";
            profileBio.textContent = "Profile details could not be loaded.";
        }
    }

    async function openShop() {
        const uid = window.HCFirebaseData?.getCurrentUserId?.();
        if (!uid) {
            setNotice("Sign in to customize your profile.", "warning");
            shopModal?.classList.remove("hidden");
            shopModal?.setAttribute("aria-hidden", "false");
            return;
        }
        let profile = window.HCFirebaseData?.getCurrentProfile?.() || null;
        if (!profile) profile = await window.HCFirebaseData?.getPublicProfile?.(uid);
        activeProfile = profile ? { ...profile, uid } : { uid, realName: "Your profile", username: "" };
        const cosmetics = getCosmetics(activeProfile);
        shopPreviewName.textContent = activeProfile.realName || activeProfile.username || "Your profile";
        setAvatar(shopPreviewAvatar, activeProfile, cosmetics, false);
        shopModal?.classList.remove("hidden");
        shopModal?.setAttribute("aria-hidden", "false");
        setNotice("Free cosmetics can be equipped. Premium items are preview-only until secure checkout is connected.");
    }

    async function equipFreeClassic() {
        const uid = window.HCFirebaseData?.getCurrentUserId?.();
        if (!uid) {
            setNotice("Sign in before equipping profile cosmetics.", "warning");
            return;
        }
        const cosmetics = { avatarFrame: "classic", profileEffect: "none", nameplate: "none" };
        storeLocalCosmetics(uid, cosmetics);
        setAvatar(shopPreviewAvatar, activeProfile || { realName: "HC" }, cosmetics, false);
        try {
            if (!window.HCFirebaseData?.saveMyProfileCosmetics) throw new Error("Cloud profile customization is not available.");
            await window.HCFirebaseData.saveMyProfileCosmetics(cosmetics);
            setNotice("Classic Orbit equipped and saved to your profile.", "success");
        } catch (error) {
            setNotice("Preview applied on this device. Cloud saving is blocked until Firestore rules allow the profileCosmetics field. No payment was taken.", "warning");
        }
    }

    function previewPremium(itemId) {
        activePreview = itemId;
        const frame = itemId === "aurora-frame" ? "aurora" : itemId === "ember-effect" ? "ember" : "classic";
        shopPreviewAvatar.dataset.frame = frame;
        setNotice("Previewing " + (itemId === "aurora-frame" ? "Aurora Frame" : itemId === "ember-effect" ? "Ember Halo" : "Midnight Nameplate") + ". Checkout is not connected, so this item cannot be purchased yet.", "warning");
        document.querySelectorAll(".hc-shop-item").forEach(item => item.classList.toggle("hc-shop-item--previewing", item.dataset.itemId === itemId));
    }

    async function hydrateRoleBadges(root = document) {
        if (!window.HCFirebaseData?.getPublicProfile) return;
        const triggers = [...root.querySelectorAll(".post-author-name[data-profile-uid], .reply-author-name[data-profile-uid]")];
        const unique = new Map();
        for (const trigger of triggers) {
            const uid = trigger.dataset.profileUid;
            const communityId = trigger.dataset.communityId;
            if (uid && communityId && !window.HCFirebaseData.isDeveloperUid?.(uid)) unique.set(uid + "|" + communityId, { uid, communityId, name: trigger.dataset.communityName || "Community", trigger });
        }
        for (const item of unique.values()) {
            try {
                const profile = await window.HCFirebaseData.getPublicProfile(item.uid);
                if (!profile || !Array.isArray(profile.moderatorCommunityIds) || !profile.moderatorCommunityIds.includes(item.communityId)) continue;
                const trigger = item.trigger;
                const parent = trigger.parentElement;
                if (!parent || parent.querySelector('.hc-role-badge[data-mod-community="' + CSS.escape(item.communityId) + '"]')) continue;
                const badge = roleBadge("MOD · " + item.name.toUpperCase(), "mod");
                badge.dataset.modCommunity = item.communityId;
                trigger.insertAdjacentElement("afterend", badge);
            } catch (_) {
                // Profile badges are decorative; a lookup failure must not interrupt posting.
            }
        }
    }

    document.addEventListener("click", event => {
        const trigger = event.target.closest("[data-hc-open-profile]");
        if (trigger) {
            event.preventDefault();
            openProfile(trigger.dataset.profileUid, {
                communityId: trigger.dataset.communityId || "",
                communityName: trigger.dataset.communityName || ""
            }, trigger.textContent.trim());
            return;
        }
        if (event.target.closest("[data-hc-close-profile]")) {
            profileModal?.classList.add("hidden");
            profileModal?.setAttribute("aria-hidden", "true");
        }
        if (event.target.closest("[data-hc-close-shop]")) {
            shopModal?.classList.add("hidden");
            shopModal?.setAttribute("aria-hidden", "true");
        }
        if (event.target.closest("#openProfileCustomizationButton, #hcOpenShopFromProfile")) {
            if (profileModal && !profileModal.classList.contains("hidden")) {
                profileModal.classList.add("hidden");
                profileModal.setAttribute("aria-hidden", "true");
            }
            openShop();
        }
        const equip = event.target.closest("[data-equip-cosmetic]");
        if (equip) equipFreeClassic();
        const preview = event.target.closest("[data-preview-cosmetic]");
        if (preview) previewPremium(preview.dataset.previewCosmetic);
    });

    document.addEventListener("keydown", event => {
        if ((event.key === "Enter" || event.key === " ") && event.target.matches("[data-hc-open-profile]")) {
            event.preventDefault();
            event.target.click();
        }
        if (event.key === "Escape") {
            profileModal?.classList.add("hidden");
            shopModal?.classList.add("hidden");
            profileModal?.setAttribute("aria-hidden", "true");
            shopModal?.setAttribute("aria-hidden", "true");
        }
    });

    document.addEventListener("hc-firebase-ready", () => hydrateRoleBadges(document));
    const settingsButton = byId("openProfileCustomizationButton");
    settingsButton?.addEventListener("click", openShop);

    window.HCProfileCustomization = { openProfile, openShop, hydrateRoleBadges };
})();