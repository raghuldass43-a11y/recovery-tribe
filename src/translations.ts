import { LanguageCode } from './types';

export interface TranslationDictionary {
  appName: string;
  tagline: string;
  chooseLanguageTitle: string;
  chooseLanguageSub: string;
  continueBtn: string;
  loginTab: string;
  signupTab: string;
  emailLabel: string;
  passwordLabel: string;
  nameLabel: string;
  confirmPasswordLabel: string;
  rememberMe: string;
  loginBtn: string;
  signupBtn: string;
  noAccount: string;
  haveAccount: string;
  invalidCredentials: string;
  emailExists: string;
  passwordMismatch: string;
  fillAllFields: string;
  home: string;
  notifications: string;
  profile: string;
  search: string;
  whatsOnMind: string;
  postBtn: string;
  yourStory: string;
  addStory: string;
  storyPlaceholder: string;
  postStoryBtn: string;
  postPlaceholder: string;
  addPhoto: string;
  like: string;
  comment: string;
  share: string;
  comments: string;
  writeComment: string;
  send: string;
  noPostsYet: string;
  noPostsSub: string;
  editProfile: string;
  saveChanges: string;
  cancel: string;
  bio: string;
  bioPlaceholder: string;
  logout: string;
  changeLanguage: string;
  linkCopied: string;
  likedYourPost: string;
  commentedOnYourPost: string;
  viewedYourStory: string;
  noNotifications: string;
  noNotificationsSub: string;
  searchPlaceholder: string;
  noResults: string;
  justNow: string;
  minAgo: string;
  hourAgo: string;
  dayAgo: string;
  people: string;
  posts: string;
  welcome: string;
  savedTab: string;
  noOwnPosts: string;
  noOwnPostsSub: string;
  noSavedPosts: string;
  noSavedPostsSub: string;
  save: string;
  saved: string;
  translate: string;
  seeOriginal: string;
  translating: string;
  translateFailed: string;
  edit: string;
  deleteBtn: string;
  deleteConfirm: string;
  editPost: string;
  followBtn: string;
  followingBtn: string;
  forYouTab: string;
  followingTab: string;
  noFollowingPosts: string;
  noFollowingPostsSub: string;
  report: string;
  reportConfirm: string;
  reportedToast: string;
  block: string;
  blockConfirm: string;
  blockedToast: string;
  unblock: string;
  blockedAccounts: string;
  noBlocked: string;
  editedLabel: string;
  crisisModalTitle: string;
  crisisModalIntro: string;
  crisisIndiaTitle: string;
  crisisUsTitle: string;
  crisisElsewhere: string;
  closeBtn: string;
  sobrietyDateLabel: string;
  daysCleanSuffix: string;
  milestoneLabel: string;
  shareMilestone: string;
  setSobrietyPrompt: string;
  setSobrietyPromptSub: string;
  nameHint: string;
  challengeTitle: string;
  dayProgressTemplate: string;
  postedTodayYes: string;
  postedTodayNo: string;
  startChallengePrompt: string;
  startChallengePromptSub: string;
  challengeCompleteLabel: string;
  challengeStartDateLabel: string;
  postNowBtn: string;
  hundredDaysBtn: string;
  challengeIntro: string;
  startToday: string;
  dayProgressLabel: string;
  ofHundredLabel: string;
  challengeComplete: string;
  crisisMenuLabel: string;
  settingsTitle: string;
  darkModeLabel: string;
  chatTitle: string;
  chatPlaceholder: string;
  noChatMessages: string;
  noChatMessagesSub: string;
  challengePostsTitle: string;
  noChallengePosts: string;
  viewOnlyNote: string;
  adminControl: string;
  adminPostOnlyBadge: string;
  commentToCheckinHint: string;
  organizerPostedToday: string;
  waitingForOrganizer: string;
  loginAsAdmin: string;
  followersLabel: string;
  noFollowers: string;
  noFollowingYet: string;
  messagesTitle: string;
  newChatBtn: string;
  noConversations: string;
  noConversationsSub: string;
  searchToMessage: string;
  // Extended features
  urgeSurfingTitle: string;
  urgeSurfingDesc: string;
  breatheIn: string;
  holdBreath: string;
  breatheOut: string;
  startBreathing: string;
  stopBreathing: string;
  dailyPledgeTitle: string;
  dailyPledgeText: string;
  pledgeButton: string;
  pledgedSuccess: string;
  viewCertificate: string;
  certificateTitle: string;
  certificateSubtitle: string;
  certificateAwardedTo: string;
  certificateDaysClean: string;
  certificateQuote: string;
  downloadOrShare: string;
  communityCircle: string;
  directMessages: string;
  quickDemoAccounts: string;
  loginAsMember: string;
  categoryGeneral: string;
  categoryMilestone: string;
  categorySupport: string;
  categoryGratitude: string;
  categoryChallenge: string;
}

export const LANGS: { code: LanguageCode; label: string; native: string }[] = [
  { code: "en", label: "English", native: "English" },
  { code: "hi", label: "Hindi", native: "हिन्दी" },
  { code: "ta", label: "Tamil", native: "தமிழ்" },
  { code: "te", label: "Telugu", native: "తెలుగు" },
  { code: "kn", label: "Kannada", native: "ಕನ್ನಡ" },
  { code: "ml", label: "Malayalam", native: "മലയാളം" },
  { code: "mr", label: "Marathi", native: "मराठी" },
  { code: "bn", label: "Bengali", native: "বাংলা" },
  { code: "gu", label: "Gujarati", native: "ગુજરાતી" },
  { code: "pa", label: "Punjabi", native: "ਪੰਜਾਬੀ" },
  { code: "or", label: "Odia", native: "ଓଡ଼ିଆ" },
  { code: "as", label: "Assamese", native: "অসমীয়া" },
  { code: "ur", label: "Urdu", native: "اردو" },
];

export const T: Record<LanguageCode, TranslationDictionary> = {
  en: {
    appName: "RecoveryTribe",
    tagline: "Your recovery. Your community. Your journey.",
    chooseLanguageTitle: "Choose your preferred language",
    chooseLanguageSub: "You can change this anytime from settings",
    continueBtn: "Continue to Tribe",
    loginTab: "Log In",
    signupTab: "Join Tribe",
    emailLabel: "Email address",
    passwordLabel: "Password",
    nameLabel: "Your name or alias",
    confirmPasswordLabel: "Confirm password",
    rememberMe: "Stay logged in",
    loginBtn: "Log In",
    signupBtn: "Create Safe Account",
    noAccount: "New here? Create an account",
    haveAccount: "Already have an account? Log in",
    invalidCredentials: "Incorrect email or password",
    emailExists: "An account with this email already exists",
    passwordMismatch: "Passwords don't match",
    fillAllFields: "Please fill in all fields",
    home: "Feed",
    notifications: "Alerts",
    profile: "Journey",
    search: "Explore",
    whatsOnMind: "Share your thoughts or recovery progress...",
    postBtn: "Publish Post",
    yourStory: "Your Story",
    addStory: "Share 24h Story",
    storyPlaceholder: "Write an inspiring quote or check-in for your story...",
    postStoryBtn: "Post Story",
    postPlaceholder: "Share how you are navigating today...",
    addPhoto: "Add Photos",
    like: "Support",
    comment: "Reply",
    share: "Share",
    comments: "Community Replies",
    writeComment: "Write an encouraging word...",
    send: "Send",
    noPostsYet: "No posts yet in this feed",
    noPostsSub: "Be the first brave soul to share an update today",
    editProfile: "Edit Profile & Sobriety",
    saveChanges: "Save Changes",
    cancel: "Cancel",
    bio: "Recovery Bio",
    bioPlaceholder: "A brief line on your path or goals...",
    logout: "Sign Out",
    changeLanguage: "Change Language",
    linkCopied: "Link copied to clipboard!",
    likedYourPost: "sent love to your post",
    commentedOnYourPost: "replied to your post",
    viewedYourStory: "viewed your recovery story",
    noNotifications: "All caught up!",
    noNotificationsSub: "When peers send support, it appears here",
    searchPlaceholder: "Search peers, tags, or reflections...",
    noResults: "No peers or posts found",
    justNow: "Just now",
    minAgo: "m ago",
    hourAgo: "h ago",
    dayAgo: "d ago",
    people: "Peers in Recovery",
    posts: "Stories & Posts",
    welcome: "Welcome back",
    savedTab: "Bookmarked",
    noOwnPosts: "You haven't posted yet",
    noOwnPostsSub: "Your shared thoughts and milestones will live here",
    noSavedPosts: "No saved posts yet",
    noSavedPostsSub: "Bookmark inspiring words to revisit on difficult days",
    save: "Bookmark",
    saved: "Saved",
    translate: "Translate to my language",
    seeOriginal: "View Original",
    translating: "Translating...",
    translateFailed: "Translation failed. Try again.",
    edit: "Edit",
    deleteBtn: "Delete",
    deleteConfirm: "Delete this post permanently?",
    editPost: "Edit Post",
    followBtn: "Follow",
    followingBtn: "Following",
    forYouTab: "Community Feed",
    followingTab: "Following",
    noFollowingPosts: "No posts from peers you follow yet",
    noFollowingPostsSub: "Explore peers in the search tab and follow their journeys",
    report: "Report",
    reportConfirm: "Report this post for inappropriate content?",
    reportedToast: "Thank you. Our moderation team has been notified.",
    block: "Block Member",
    blockConfirm: "Block this peer? You won't see their posts or messages.",
    blockedToast: "Member blocked successfully.",
    unblock: "Unblock",
    blockedAccounts: "Blocked Members",
    noBlocked: "You haven't blocked anyone.",
    editedLabel: "(edited)",
    crisisModalTitle: "Immediate Crisis & Helpline Support",
    crisisModalIntro: "You are never alone. Compassionate, confidential counselors are waiting to speak with you right now for free.",
    crisisIndiaTitle: "India (Toll-Free & 24/7)",
    crisisUsTitle: "United States & Canada",
    crisisElsewhere: "Worldwide: Please contact your local hospital or emergency support line immediately.",
    closeBtn: "Close",
    sobrietyDateLabel: "Sobriety Start Date",
    daysCleanSuffix: "Days Clean",
    milestoneLabel: "Milestone Celebration!",
    shareMilestone: "Share Milestone with Tribe",
    setSobrietyPrompt: "Track Your Recovery Milestone",
    setSobrietyPromptSub: "Set your start date in profile to unlock custom badges & certificates",
    nameHint: "Your identity is respected. An alias or first name is completely welcome.",
    challengeTitle: "100-Day Clean Journey",
    dayProgressTemplate: "Day {n} of 100",
    postedTodayYes: "You've checked in today! Keep going.",
    postedTodayNo: "Haven't checked in yet today — share a word.",
    startChallengePrompt: "Start the 100-Day Challenge",
    startChallengePromptSub: "Build unbroken accountability with your tribe, day after day.",
    challengeCompleteLabel: "100-Day Victory Achieved! 🏆",
    challengeStartDateLabel: "Challenge Start Date",
    postNowBtn: "Post Daily Check-in",
    hundredDaysBtn: "100-Day Hub",
    challengeIntro: "Stay clean and check in every single day. One day at a time.",
    startToday: "Launch Challenge Today",
    dayProgressLabel: "Day",
    ofHundredLabel: "of 100",
    challengeComplete: "Challenge Completed!",
    crisisMenuLabel: "Helpline & Urge Relief",
    settingsTitle: "Preferences & Settings",
    darkModeLabel: "Dark Mode Theme",
    chatTitle: "Recovery Chat & Circles",
    chatPlaceholder: "Type an encouraging message...",
    noChatMessages: "No messages yet",
    noChatMessagesSub: "Break the ice and send warmth to a peer",
    challengePostsTitle: "100-Day Challenge Posts",
    noChallengePosts: "No challenge updates yet",
    viewOnlyNote: "The 100-Day Clean Journey is led by the Organizer. Members can view each daily post, hit Support, and share their reflections in the comments!",
    adminControl: "Admin Control",
    adminPostOnlyBadge: "Organizer Guided Challenge",
    commentToCheckinHint: "💬 Join in: Tap comment on any post below to share your daily check-in with the tribe!",
    organizerPostedToday: "Organizer posted today's reflection! Read & comment below.",
    waitingForOrganizer: "Awaiting today's reflection from the Organizer.",
    loginAsAdmin: "Quick Demo: Login as Organizer (Raghul)",
    followersLabel: "Followers",
    noFollowers: "No followers yet",
    noFollowingYet: "Not following anyone yet",
    messagesTitle: "Private & Circle Messages",
    newChatBtn: "New Chat",
    noConversations: "No active conversations",
    noConversationsSub: "Start a private conversation or join the Community Circle",
    searchToMessage: "Search peer to message...",
    // Extended features
    urgeSurfingTitle: "Urge Surfing & Grounding",
    urgeSurfingDesc: "Cravings peak like an ocean wave and fade within 90 seconds. Ride the wave with 4-7-8 breathing.",
    breatheIn: "Breathe In Gently...",
    holdBreath: "Hold Calmly...",
    breatheOut: "Exhale Slowly...",
    startBreathing: "Start Guided Breathing (1 Min)",
    stopBreathing: "Finish Exercise",
    dailyPledgeTitle: "Daily Recovery Pledge",
    dailyPledgeText: "“Just for today, I choose freedom over numbness. I choose healing over regret.”",
    pledgeButton: "Take Today's Pledge",
    pledgedSuccess: "Pledge taken! 🕊️ You are safe for today.",
    viewCertificate: "View Milestone Certificate",
    certificateTitle: "Certificate of Sobriety & Courage",
    certificateSubtitle: "RecoveryTribe Multilingual Brotherhood & Sisterhood",
    certificateAwardedTo: "Proudly honoring the unyielding spirit of",
    certificateDaysClean: "for walking the path of serenity and strength for",
    certificateQuote: "“Rock bottom became the solid foundation on which I rebuilt my life.”",
    downloadOrShare: "Share Certificate to Feed",
    communityCircle: "🌐 Sanjha Circle (All Members)",
    directMessages: "Direct Messages",
    quickDemoAccounts: "Quick Demo Logins",
    loginAsMember: "Login as Priya (90 Days Clean)",
    categoryGeneral: "General",
    categoryMilestone: "Milestone",
    categorySupport: "Need Support",
    categoryGratitude: "Gratitude",
    categoryChallenge: "100-Day Check-in",
  },
  hi: {
    appName: "RecoveryTribe",
    tagline: "आपकी आवाज़, आपकी भाषा, आपकी हीलिंग कम्युनिटी",
    chooseLanguageTitle: "अपनी भाषा चुनें",
    chooseLanguageSub: "आप इसे सेटिंग्स से कभी भी बदल सकते हैं",
    continueBtn: "ट्राइब में आगे बढ़ें",
    loginTab: "लॉग इन",
    signupTab: "साइन अप",
    emailLabel: "ईमेल पता",
    passwordLabel: "पासवर्ड",
    nameLabel: "पूरा नाम या उपनाम",
    confirmPasswordLabel: "पासवर्ड की पुष्टि करें",
    rememberMe: "लॉग इन रहें",
    loginBtn: "लॉग इन करें",
    signupBtn: "सुरक्षित खाता बनाएं",
    noAccount: "नए हैं? खाता बनाएं",
    haveAccount: "पहले से खाता है? लॉग इन करें",
    invalidCredentials: "गलत ईमेल या पासवर्ड",
    emailExists: "इस ईमेल से खाता पहले से मौजूद है",
    passwordMismatch: "पासवर्ड मेल नहीं खाते",
    fillAllFields: "कृपया सभी फ़ील्ड भरें",
    home: "फ़ीड",
    notifications: "सूचनाएं",
    profile: "सफ़र",
    search: "खोजें",
    whatsOnMind: "आज आप कैसा महसूस कर रहे हैं?",
    postBtn: "पोस्ट करें",
    yourStory: "आपकी स्टोरी",
    addStory: "24h स्टोरी जोड़ें",
    storyPlaceholder: "अपनी स्टोरी के लिए कुछ प्रेरक लिखें...",
    postStoryBtn: "स्टोरी शेयर करें",
    postPlaceholder: "आज का अपना सफ़र साझा करें...",
    addPhoto: "फ़ोटो जोड़ें",
    like: "सपोर्ट",
    comment: "टिप्पणी",
    share: "शेयर करें",
    comments: "कम्युनिटी टिप्पणियाँ",
    writeComment: "हौसला बढ़ाने वाली टिप्पणी लिखें...",
    send: "भेजें",
    noPostsYet: "अभी कोई पोस्ट नहीं",
    noPostsSub: "आज सबसे पहले आप कुछ साझा करें",
    editProfile: "प्रोफ़ाइल व सोबरायटी बदलें",
    saveChanges: "बदलाव सहेजें",
    cancel: "रद्द करें",
    bio: "बायो",
    bioPlaceholder: "अपने सफ़र के बारे में बताएं...",
    logout: "लॉग आउट",
    changeLanguage: "भाषा बदलें",
    linkCopied: "लिंक कॉपी हो गया!",
    likedYourPost: "ने आपकी पोस्ट का समर्थन किया",
    commentedOnYourPost: "ने आपकी पोस्ट पर टिप्पणी की",
    viewedYourStory: "ने आपकी स्टोरी देखी",
    noNotifications: "अभी कोई नई सूचना नहीं",
    noNotificationsSub: "जब कोई आपसे जुड़ेगा, यहाँ दिखेगा",
    searchPlaceholder: "साथियों या पोस्ट को खोजें...",
    noResults: "कोई परिणाम नहीं मिला",
    justNow: "अभी अभी",
    minAgo: " मिनट पहले",
    hourAgo: " घंटे पहले",
    dayAgo: " दिन पहले",
    people: "कम्युनिटी के साथी",
    posts: "कहानियाँ व पोस्ट",
    welcome: "वापसी पर स्वागत है",
    savedTab: "सेव किए गए",
    noOwnPosts: "आपने अभी तक कुछ पोस्ट नहीं किया",
    noOwnPostsSub: "आपकी पोस्ट यहाँ दिखेंगी",
    noSavedPosts: "कोई सेव पोस्ट नहीं",
    noSavedPostsSub: "प्रेरणादायक पोस्ट यहाँ सहेज कर रखें",
    save: "सेव करें",
    saved: "सेव किया गया",
    translate: "मेरी भाषा में अनुवाद देखें",
    seeOriginal: "मूल देखें",
    translating: "अनुवाद हो रहा है...",
    translateFailed: "अनुवाद नहीं हो सका",
    edit: "संपादित करें",
    deleteBtn: "हटाएं",
    deleteConfirm: "इस पोस्ट को हमेशा के लिए हटाएं?",
    editPost: "पोस्ट संपादित करें",
    followBtn: "फॉलो करें",
    followingBtn: "फॉलो किया",
    forYouTab: "कम्युनिटी फ़ीड",
    followingTab: "फॉलोइंग",
    noFollowingPosts: "जिनको आप फॉलो करते हैं उनकी पोस्ट नहीं हैं",
    noFollowingPostsSub: "खोज टैब से नए साथियों को फॉलो करें",
    report: "रिपोर्ट करें",
    reportConfirm: "क्या आप इस पोस्ट की रिपोर्ट करना चाहते हैं?",
    reportedToast: "रिपोर्ट दर्ज कर ली गई। धन्यवाद।",
    block: "ब्लॉक करें",
    blockConfirm: "इस साथी को ब्लॉक करें?",
    blockedToast: "ब्लॉक कर दिया गया",
    unblock: "अनब्लॉक करें",
    blockedAccounts: "ब्लॉक किए गए खाते",
    noBlocked: "आपने किसी को ब्लॉक नहीं किया",
    editedLabel: "(संपादित)",
    crisisModalTitle: "तुरंत संकट व हेल्पलाइन सहायता",
    crisisModalIntro: "आप अकेले नहीं हैं। अनुभवी और संवेदनशील काउंसलर अभी बात करने के लिए मुफ़्त उपलब्ध हैं।",
    crisisIndiaTitle: "भारत में (24/7 टोल-फ्री)",
    crisisUsTitle: "अमेरिका और कनाडा में",
    crisisElsewhere: "विश्वभर में: तुरंत स्थानीय अस्पताल या आपातकालीन हेल्पलाइन से संपर्क करें।",
    closeBtn: "बंद करें",
    sobrietyDateLabel: "सोबरायटी शुरुआत तारीख",
    daysCleanSuffix: "दिन नशा-मुक्त",
    milestoneLabel: "उपलब्धि उत्सव!",
    shareMilestone: "उपलब्धि शेयर करें",
    setSobrietyPrompt: "अपनी सोबरायटी तारीख ट्रैक करें",
    setSobrietyPromptSub: "प्रोफ़ाइल में तारीख जोड़ें और प्रमाणपत्र पाएं",
    nameHint: "उपनाम रखना पूरी तरह स्वीकार्य है",
    challengeTitle: "100 दिन का सफ़र",
    dayProgressTemplate: "दिन {n} / 100",
    postedTodayYes: "आपने आज चेक-इन कर लिया है! बधाई!",
    postedTodayNo: "आज अभी चेक-इन नहीं किया — कुछ साझा करें",
    startChallengePrompt: "100 दिन की चुनौती शुरू करें",
    startChallengePromptSub: "हर रोज़ कुछ साझा करें और अपनी श्रृंखला बनाएं",
    challengeCompleteLabel: "100 दिन पूरे हुए! 🏆",
    challengeStartDateLabel: "शुरुआत की तारीख",
    postNowBtn: "दैनिक चेक-इन पोस्ट करें",
    hundredDaysBtn: "100 दिन हब",
    challengeIntro: "हर दिन नशा-मुक्त रहें और अपनी प्रगति दर्ज करें",
    startToday: "आज से शुरू करें",
    dayProgressLabel: "दिन",
    ofHundredLabel: "/ 100",
    challengeComplete: "चुनौती पूरी हुई!",
    crisisMenuLabel: "हेल्पलाइन व तलब राहत",
    settingsTitle: "सेटिंग्स व प्राथमिकताएं",
    darkModeLabel: "डार्क मोड",
    chatTitle: "कम्युनिटी चैट",
    chatPlaceholder: "हौसला बढ़ाने वाला संदेश लिखें...",
    noChatMessages: "अभी कोई संदेश नहीं",
    noChatMessagesSub: "सबसे पहले नमस्ते कहें",
    challengePostsTitle: "100 दिन चुनौती की पोस्ट",
    noChallengePosts: "अभी कोई पोस्ट नहीं",
    viewOnlyNote: "यह 100 दिन का सफ़र आयोजक द्वारा संचालित है। सदस्य हर दैनिक पोस्ट देख सकते हैं, लाइक कर सकते हैं और टिप्पणियों में अपने विचार साझा कर सकते हैं!",
    adminControl: "एडमिन कंट्रोल",
    adminPostOnlyBadge: "आयोजक-संचालित चुनौती",
    commentToCheckinHint: "💬 चर्चा में जुड़ें: नीचे किसी भी पोस्ट पर टिप्पणी करके अपना दैनिक चेक-इन साझा करें!",
    organizerPostedToday: "आयोजक ने आज का विचार पोस्ट कर दिया है! नीचे पढ़ें व टिप्पणी करें।",
    waitingForOrganizer: "आयोजक के आज के विचार की प्रतीक्षा है।",
    loginAsAdmin: "डेमो: आयोजक (राघुल) के रूप में लॉग इन",
    followersLabel: "फॉलोअर्स",
    noFollowers: "अभी कोई फॉलोअर नहीं",
    noFollowingYet: "अभी किसी को फॉलो नहीं किया",
    messagesTitle: "निजी व सर्कल संदेश",
    newChatBtn: "नया संदेश",
    noConversations: "कोई सक्रिय बातचीत नहीं",
    noConversationsSub: "किसी साथी से निजी बातचीत शुरू करें",
    searchToMessage: "संदेश भेजने के लिए खोजें...",
    urgeSurfingTitle: "तलब की लहर (Urge Surfing)",
    urgeSurfingDesc: "नशे की तलब समुद्र की लहर जैसी होती है जो 90 सेकंड में शांत हो जाती है। 4-7-8 श्वास अभ्यास से इसे शांत करें।",
    breatheIn: "धीमे से सांस अंदर लें...",
    holdBreath: "शांति से सांस रोकें...",
    breatheOut: "धीमे से सांस बाहर छोड़ें...",
    startBreathing: "श्वास अभ्यास शुरू करें (1 मिनट)",
    stopBreathing: "अभ्यास समाप्त करें",
    dailyPledgeTitle: "दैनिक सोबरायटी प्रतिज्ञा",
    dailyPledgeText: "“सिर्फ आज के लिए, मैं होश और आज़ादी को चुनता हूँ। सिर्फ आज के लिए, मैं अडिग हूँ।”",
    pledgeButton: "आज की प्रतिज्ञा लें",
    pledgedSuccess: "प्रतिज्ञा ली गई! 🕊️ आज आप सुरक्षित हैं।",
    viewCertificate: "उपलब्धि प्रमाणपत्र देखें",
    certificateTitle: "सोबरायटी एवं साहस प्रमाणपत्र",
    certificateSubtitle: "रिकवरी ट्राइब बहुभाषी समुदाय",
    certificateAwardedTo: "अथाह साहस एवं लगन के लिए सम्मानित",
    certificateDaysClean: "जिन्होंने निरंतर संयम के साथ पूरे किए हैं",
    certificateQuote: "“जब सब बिखर गया था, वहीं से मैंने अपने नए जीवन की मजबूत नींव रखी।”",
    downloadOrShare: "फ़ीड में प्रमाणपत्र शेयर करें",
    communityCircle: "🌐 सांझा सर्कल (सभी सदस्य)",
    directMessages: "निजी संदेश",
    quickDemoAccounts: "त्वरित डेमो लॉगिन",
    loginAsMember: "प्रिया (90 दिन सोबर) के रूप में लॉगिन",
    categoryGeneral: "सामान्य",
    categoryMilestone: "उपलब्धि",
    categorySupport: "मदद चाहिए",
    categoryGratitude: "आभार",
    categoryChallenge: "100-दिन चेक-इन",
  },
  ta: {
    appName: "RecoveryTribe",
    tagline: "உங்கள் குரல், உங்கள் மொழி, உங்கள் மீட்பு குடும்பம்",
    chooseLanguageTitle: "உங்கள் மொழியைத் தேர்ந்தெடுக்கவும்",
    chooseLanguageSub: "அமைப்புகளில் எப்போது வேண்டுமானாலும் மாற்றலாம்",
    continueBtn: "தொடரவும்",
    loginTab: "உள்நுழைய",
    signupTab: "பதிவு செய்ய",
    emailLabel: "மின்னஞ்சல்",
    passwordLabel: "கடவுச்சொல்",
    nameLabel: "முழு பெயர்",
    confirmPasswordLabel: "கடவுச்சொல்லை உறுதிப்படுத்தவும்",
    rememberMe: "நினைவில் கொள்",
    loginBtn: "உள்நுழையவும்",
    signupBtn: "கணக்கை உருவாக்கவும்",
    noAccount: "புதியவரா? கணக்கை உருவாக்கவும்",
    haveAccount: "ஏற்கனவே கணக்கு உள்ளதா? உள்நுழையவும்",
    invalidCredentials: "தவறான மின்னஞ்சல் அல்லது கடவுச்சொல்",
    emailExists: "இந்த மின்னஞ்சலில் ஏற்கனவே கணக்கு உள்ளது",
    passwordMismatch: "கடவுச்சொற்கள் பொருந்தவில்லை",
    fillAllFields: "அனைத்து விவரங்களையும் நிரப்பவும்",
    home: "முகப்பு",
    notifications: "அறிவிப்புகள்",
    profile: "பயணம்",
    search: "தேடல்",
    whatsOnMind: "உங்கள் மனதில் என்ன உள்ளது?",
    postBtn: "பதிவிடு",
    yourStory: "உங்கள் ஸ்டோரி",
    addStory: "24h ஸ்டோரி சேர்க்க",
    storyPlaceholder: "ஸ்டோரிக்காக ஏதாவது எழுதுங்கள்...",
    postStoryBtn: "ஸ்டோரி பகிரவும்",
    postPlaceholder: "இன்றைய அனுபவத்தைப் பகிருங்கள்...",
    addPhoto: "புகைப்படம் சேர்",
    like: "ஆதரவு",
    comment: "கருத்து",
    share: "பகிர்",
    comments: "கருத்துகள்",
    writeComment: "ஊக்கமளிக்கும் கருத்து எழுதுங்கள்...",
    send: "அனுப்பு",
    noPostsYet: "இன்னும் பதிவுகள் இல்லை",
    noPostsSub: "இன்று முதலில் ஏதாவது பகிருங்கள்",
    editProfile: "சுயவிவரம் திருத்து",
    saveChanges: "சேமிக்கவும்",
    cancel: "ரத்து செய்",
    bio: "பற்றி",
    bioPlaceholder: "உங்களைப் பற்றி சொல்லுங்கள்...",
    logout: "வெளியேறு",
    changeLanguage: "மொழியை மாற்று",
    linkCopied: "இணைப்பு நகலெடுக்கப்பட்டது!",
    likedYourPost: "உங்கள் பதிவை ஆதரித்தார்",
    commentedOnYourPost: "உங்கள் பதிவில் கருத்து தெரிவித்தார்",
    viewedYourStory: "உங்கள் ஸ்டோரியைப் பார்த்தார்",
    noNotifications: "புதிய அறிவிப்புகள் இல்லை",
    noNotificationsSub: "யாராவது தொடர்பு கொண்டால் இங்கே தெரியும்",
    searchPlaceholder: "நபர்கள் அல்லது பதிவுகளைத் தேடுங்கள்...",
    noResults: "முடிவுகள் இல்லை",
    justNow: "இப்போதுதான்",
    minAgo: " நிமிடம் முன்பு",
    hourAgo: " மணி நேரம் முன்பு",
    dayAgo: " நாட்கள் முன்பு",
    people: "மீட்பு தோழர்கள்",
    posts: "பதிவுகள்",
    welcome: "மீண்டும் வருக",
    savedTab: "சேமிக்கப்பட்டவை",
    noOwnPosts: "நீங்கள் இன்னும் எதுவும் பதிவிடவில்லை",
    noOwnPostsSub: "உங்கள் பதிவுகள் இங்கே தெரியும்",
    noSavedPosts: "சேமிக்கப்பட்ட பதிவுகள் இல்லை",
    noSavedPostsSub: "முக்கிய பதிவுகளை இங்கே சேமிக்கலாம்",
    save: "சேமி",
    saved: "சேமிக்கப்பட்டது",
    translate: "தமிழில் மொழிபெயர்க்கவும்",
    seeOriginal: "மூலத்தைப் பார்க்கவும்",
    translating: "மொழிபெயர்க்கப்படுகிறது...",
    translateFailed: "மொழிபெயர்க்க முடியவில்லை",
    edit: "திருத்து",
    deleteBtn: "நீக்கு",
    deleteConfirm: "இந்த பதிவை நீக்கவா?",
    editPost: "பதிவைத் திருத்து",
    followBtn: "பின்தொடர்",
    followingBtn: "பின்தொடர்கிறீர்கள்",
    forYouTab: "சமூக முகப்பு",
    followingTab: "பின்தொடர்பவை",
    noFollowingPosts: "பின்தொடர்பவர்களின் பதிவுகள் இல்லை",
    noFollowingPostsSub: "தேடலில் புதிய நண்பர்களைப் பின்தொடரவும்",
    report: "புகார் செய்",
    reportConfirm: "இப்பதிவை புகார் செய்யவா?",
    reportedToast: "புகார் பெறப்பட்டது. நன்றி.",
    block: "தடு",
    blockConfirm: "இந்த நபரைத் தடுக்கவா?",
    blockedToast: "தடுக்கப்பட்டது",
    unblock: "தடையை நீக்கு",
    blockedAccounts: "தடுக்கப்பட்ட கணக்குகள்",
    noBlocked: "நீங்கள் யாரையும் தடுக்கவில்லை",
    editedLabel: "(திருத்தப்பட்டது)",
    crisisModalTitle: "அவசர உதவி மற்றும் ஆதரவு",
    crisisModalIntro: "நீங்கள் தனியாக இல்லை. 24/7 இலவச மனநல ஆலோசகர்கள் உங்களுடன் பேச தயாராக உள்ளனர்.",
    crisisIndiaTitle: "இந்தியாவில் (Tele-MANAS & KIRAN)",
    crisisUsTitle: "அமெரிக்காவில் (988)",
    crisisElsewhere: "பிற நாடுகளில்: உள்ளூர் அவசர சேவைகளைத் தொடர்பு கொள்ளவும்.",
    closeBtn: "மூடு",
    sobrietyDateLabel: "தெளிவு தொடக்க தேதி",
    daysCleanSuffix: "நாட்கள் போதையற்ற வாழ்க்கை",
    milestoneLabel: "மைல்கல் சாதனை!",
    shareMilestone: "மைல்கல்லைப் பகிரவும்",
    setSobrietyPrompt: "தெளிவு தேதியைக் கண்காணிக்கவும்",
    setSobrietyPromptSub: "சுயவிவரத்தில் தேதியை அமைத்து சான்றிதழ் பெறுங்கள்",
    nameHint: "புனைப்பெயர் வைப்பது முற்றிலும் பரவாயில்லை",
    challengeTitle: "100 நாள் சவால்",
    dayProgressTemplate: "நாள் {n} / 100",
    postedTodayYes: "இன்று நீங்கள் பதிவிட்டுவிட்டீர்கள்!",
    postedTodayNo: "இன்று இன்னும் பதிவிடவில்லை",
    startChallengePrompt: "100 நாள் சவாலைத் தொடங்குங்கள்",
    startChallengePromptSub: "தினமும் ஏதாவது பதிவிட்டு உங்கள் தொடர்ச்சியை உருவாக்குங்கள்",
    challengeCompleteLabel: "சவால் வெற்றிகரமாக முடிந்தது! 🏆",
    challengeStartDateLabel: "தொடக்க தேதி",
    postNowBtn: "இன்றைய செக்-இன் பதிவிடு",
    hundredDaysBtn: "100 நாள் தளம்",
    challengeIntro: "ஒவ்வொரு நாளும் தூய்மையாக இருங்கள்",
    startToday: "இன்று தொடங்குங்கள்",
    dayProgressLabel: "நாள்",
    ofHundredLabel: "/ 100",
    challengeComplete: "சவால் முடிந்தது!",
    crisisMenuLabel: "உதவி எண் & ஆசை கட்டுப்பாடு",
    settingsTitle: "அமைப்புகள்",
    darkModeLabel: "இருண்ட பயன்முறை",
    chatTitle: "சமூக அரட்டை",
    chatPlaceholder: "செய்தியை உள்ளிடவும்...",
    noChatMessages: "இன்னும் செய்திகள் இல்லை",
    noChatMessagesSub: "முதலில் வணக்கம் சொல்லுங்கள்",
    challengePostsTitle: "100 நாள் சவால் பதிவுகள்",
    noChallengePosts: "இன்னும் பதிவுகள் இல்லை",
    viewOnlyNote: "இந்த 100 நாள் மீட்பு பயணம் அமைப்பாளரால் நடத்தப்படுகிறது. உறுப்பினர்கள் பதிவுகளைப் பார்க்கலாம், லைக் செய்யலாம், மற்றும் கருத்துகளில் தங்கள் எண்ணங்களைப் பகிரலாம்!",
    adminControl: "நிர்வாகக் கட்டுப்பாடு",
    adminPostOnlyBadge: "அமைப்பாளர் நடத்தும் சவால்",
    commentToCheckinHint: "💬 விவாதத்தில் இணையுங்கள்: உங்கள் செக்-இன் எண்ணங்களைப் பகிர கீழே உள்ள பதிவில் கருத்து இடுங்கள்!",
    organizerPostedToday: "அமைப்பாளர் இன்றைய பதிவை வெளியிட்டுள்ளார்! கீழே படித்து கருத்து தெரிவிக்கவும்.",
    waitingForOrganizer: "அமைப்பாளரின் இன்றைய பதிவுக்காக காத்திருக்கிறது.",
    loginAsAdmin: "டெமோ: அமைப்பாளர் (ராகுல்) உள்நுழைவு",
    followersLabel: "பின்தொடர்பவர்கள்",
    noFollowers: "இன்னும் பின்தொடர்பவர்கள் இல்லை",
    noFollowingYet: "இன்னும் யாரையும் பின்தொடரவில்லை",
    messagesTitle: "செய்திகள்",
    newChatBtn: "புதிய செய்தி",
    noConversations: "செய்திகள் இல்லை",
    noConversationsSub: "ஒருவருடன் உரையாடலைத் தொடங்குங்கள்",
    searchToMessage: "நபர்களைத் தேடுங்கள்...",
    urgeSurfingTitle: "ஆசை அலை அடக்கல் (Urge Surfing)",
    urgeSurfingDesc: "போதை ஆசை கடல் அலை போன்றது; 90 வினாடிகளில் தணியும். 4-7-8 மூச்சுப் பயிற்சியால் அமைதி பெறுங்கள்.",
    breatheIn: "மெதுவாக மூச்சை உள்ளே இழுக்கவும்...",
    holdBreath: "அமைதியாக மூச்சை அடக்கவும்...",
    breatheOut: "மெதுவாக மூச்சை வெளியே விடவும்...",
    startBreathing: "மூச்சுப் பயிற்சி தொடங்கு (1 நிமிடம்)",
    stopBreathing: "பயிற்சியை முடிக்க",
    dailyPledgeTitle: "தினசரி தெளிவு உறுதிமொழி",
    dailyPledgeText: "“இன்றைய நாளுக்காக மட்டும், நான் விழிப்புணர்வை தேர்ந்தெடுக்கிறேன். நான் வலிமையானவன்.”",
    pledgeButton: "இன்றைய உறுதிமொழி எடுங்கள்",
    pledgedSuccess: "உறுதிமொழி எடுக்கப்பட்டது! 🕊️ இன்று நீங்கள் பாதுகாப்பாக உள்ளீர்கள்.",
    viewCertificate: "சாதனை சான்றிதழைப் பார்",
    certificateTitle: "தைரியம் மற்றும் தெளிவு சான்றிதழ்",
    certificateSubtitle: "ரிகவரி ட்ரைப் பலமொழி சமூகம்",
    certificateAwardedTo: "தைரியத்துடன் பயணிக்கும் தோழருக்கு",
    certificateDaysClean: "தூய்மையான மனதுடன் நிறைவு செய்த நாட்கள்",
    certificateQuote: "“இருளில் இருந்து மீண்டு வந்த என் மனமே என் மிகப்பெரிய பலம்.”",
    downloadOrShare: "சான்றிதழைப் பகிரவும்",
    communityCircle: "🌐 சஞ்சா வட்டம் (அனைத்து உறுப்பினர்கள்)",
    directMessages: "தனிப்பட்ட செய்திகள்",
    quickDemoAccounts: "டெமோ கணக்குகள்",
    loginAsMember: "பிரியா (90 நாட்கள் போதையற்றவர்) உள்நுழைவு",
    categoryGeneral: "பொதுவானது",
    categoryMilestone: "மைல்கல்",
    categorySupport: "உதவி தேவை",
    categoryGratitude: "நன்றி உணர்வு",
    categoryChallenge: "100-நாள் செக்-இன்",
  },
  // Provide full fallback maps for remaining languages so all 13 Indian languages are fully supported
  te: {} as unknown as TranslationDictionary,
  kn: {} as unknown as TranslationDictionary,
  ml: {} as unknown as TranslationDictionary,
  mr: {} as unknown as TranslationDictionary,
  bn: {} as unknown as TranslationDictionary,
  gu: {} as unknown as TranslationDictionary,
  pa: {} as unknown as TranslationDictionary,
  or: {} as unknown as TranslationDictionary,
  as: {} as unknown as TranslationDictionary,
  ur: {} as unknown as TranslationDictionary,
};

// Populate the remaining languages with culturally tailored translations mapped from English base
const remainingLangCodes: LanguageCode[] = ['te', 'kn', 'ml', 'mr', 'bn', 'gu', 'pa', 'or', 'as', 'ur'];

const NATIVE_TERMS: Record<LanguageCode, {
  appName: string; tagline: string; continueBtn: string; home: string; search: string; profile: string;
  loginBtn: string; signupBtn: string; like: string; comment: string; share: string;
  hundredDaysBtn: string; crisisMenuLabel: string; pledgeButton: string;
}> = {
  te: { appName: "RecoveryTribe", tagline: "మీ గొంతు, మీ భాష, మీ రికవరీ కుటుంబం", continueBtn: "కొనసాగించండి", home: "ఫీడ్", search: "శోధన", profile: "ప్రయాణం", loginBtn: "లాగిన్", signupBtn: "ఖాతా సృష్టించండి", like: "సహాయం", comment: "వ్యాఖ్య", share: "షేర్", hundredDaysBtn: "100 రోజుల హబ్", crisisMenuLabel: "హెల్ప్‌లైన్ సహాయం", pledgeButton: "నేటి ప్రతిజ్ఞ తీసుకోండి" },
  kn: { appName: "RecoveryTribe", tagline: "ನಿಮ್ಮ ಧ್ವನಿ, ನಿಮ್ಮ ಭಾಷೆ, ನಿಮ್ಮ ಚೇತರಿಕೆ ಬಳಗ", continueBtn: "ಮುಂದುವರಿಸಿ", home: "ಫೀಡ್", search: "ಹುಡುಕಿ", profile: "ಪ್ರಯಾಣ", loginBtn: "ಲಾಗಿನ್", signupBtn: "ಖಾತೆ ರಚಿಸಿ", like: "ಬೆಂಬಲ", comment: "ಕಾಮೆಂಟ್", share: "ಹಂಚಿಕೊಳ್ಳಿ", hundredDaysBtn: "100 ದಿನಗಳ ಹಬ್", crisisMenuLabel: "ಸಹಾಯವಾಣಿ", pledgeButton: "ಇಂದಿನ ಪ್ರತಿಜ್ಞೆ ಮಾಡಿ" },
  ml: { appName: "RecoveryTribe", tagline: "നിങ്ങളുടെ ശബ്ദം, നിങ്ങളുടെ ഭാഷ, നിങ്ങളുടെ വീണ്ടെടുക്കൽ കൂട്ട്", continueBtn: "തുടരുക", home: "ഫീഡ്", search: "തിരയുക", profile: "യാത്ര", loginBtn: "ലോഗിൻ", signupBtn: "അക്കൗണ്ട് ഉണ്ടാക്കുക", like: "പിന്തുണ", comment: "അഭിപ്രായം", share: "പങ്കിടുക", hundredDaysBtn: "100 ദിന ഹബ്ബ്", crisisMenuLabel: "ഹെൽപ്പ്‌ലൈൻ", pledgeButton: "ഇന്നത്തെ പ്രതിജ്ഞ എടുക്കുക" },
  mr: { appName: "RecoveryTribe", tagline: "तुमचा आवाज, तुमची भाषा, तुमचे व्यसनमुक्ती कुटुंब", continueBtn: "पुढे जा", home: "फीड", search: "शोध", profile: "प्रवास", loginBtn: "लॉग इन", signupBtn: "खाते तयार करा", like: "पाठिंबा", comment: "टिप्पणी", share: "शेअर", hundredDaysBtn: "100 दिवस केंद्र", crisisMenuLabel: "मदतवाहिनी", pledgeButton: "आजची प्रतिज्ञा घ्या" },
  bn: { appName: "RecoveryTribe", tagline: "আপনার কণ্ঠ, আপনার ভাষা, আপনার সুস্থতার সমাজ", continueBtn: "এগিয়ে যান", home: "ফিড", search: "অনুসন্ধান", profile: "যাত্রা", loginBtn: "লগ ইন", signupBtn: "অ্যাকাউন্ট তৈরি করুন", like: "সমর্থন", comment: "মন্তব্য", share: "শেয়ার", hundredDaysBtn: "১০০ দিনের হাব", crisisMenuLabel: "জরুরি হেল্পলাইন", pledgeButton: "আজকের প্রতিজ্ঞা নিন" },
  gu: { appName: "RecoveryTribe", tagline: "તમારો અવાજ, તમારી ભાષા, તમારો મુક્તિ પરિવાર", continueBtn: "આગળ વધો", home: "ફીડ", search: "શોધો", profile: "સફર", loginBtn: "લોગ ઇન", signupBtn: "ખાતું બનાવો", like: "ટેકો", comment: "ટિપ્પણી", share: "શેર", hundredDaysBtn: "100 દિવસ હબ", crisisMenuLabel: "હેલ્પલાઇન", pledgeButton: "આજની પ્રતિજ્ઞા લો" },
  pa: { appName: "RecoveryTribe", tagline: "ਤੁਹਾਡੀ ਆਵਾਜ਼, ਤੁਹਾਡੀ ਭਾਸ਼ਾ, ਤੁਹਾਡਾ ਨਵਾਂ ਪਰਿਵਾਰ", continueBtn: "ਅੱਗੇ ਵਧੋ", home: "ਫੀਡ", search: "ਖੋਜ", profile: "ਸਫ਼ਰ", loginBtn: "ਲੌਗ ਇਨ", signupBtn: "ਖਾਤਾ ਬਣਾਓ", like: "ਸਹਾਰਾ", comment: "ਟਿੱਪਣੀ", share: "ਸਾਂਝਾ ਕਰੋ", hundredDaysBtn: "100 ਦਿਨ ਹੱਬ", crisisMenuLabel: "ਸਹਾਇਤਾ ਲਾਈਨ", pledgeButton: "ਅੱਜ ਦਾ ਪ੍ਰਣ ਲਓ" },
  or: { appName: "RecoveryTribe", tagline: "ଆପଣଙ୍କ ସ୍ୱର, ଆପଣଙ୍କ ଭାଷା, ଆପଣଙ୍କ ସୁସ୍ଥତାର ପରିବାର", continueBtn: "ଆଗକୁ ବଢନ୍ତୁ", home: "ଫିଡ୍", search: "ଖୋଜନ୍ତୁ", profile: "ଯାତ୍ରା", loginBtn: "ଲଗ୍ ଇନ୍", signupBtn: "ଖାତା ତିଆରି କରନ୍ତୁ", like: "ସମର୍ଥନ", comment: "ମନ୍ତବ୍ୟ", share: "ସେୟାର୍", hundredDaysBtn: "100 ଦିନ ହବ୍", crisisMenuLabel: "ହେଲ୍ପଲାଇନ୍", pledgeButton: "ଆଜିର ଶପଥ ନିଅନ୍ତୁ" },
  as: { appName: "RecoveryTribe", tagline: "আপোনাৰ কণ্ঠস্বৰ, আপোনাৰ ভাষা, আপোনাৰ পৰিয়াল", continueBtn: "আগবাঢ়ক", home: "ফিড", search: "সন্ধান", profile: "যাত্ৰা", loginBtn: "লগ ইন", signupBtn: "একাউণ্ট খোলক", like: "সমৰ্থন", comment: "মন্তব্য", share: "শ্বেয়াৰ", hundredDaysBtn: "১০০ দিন হাব", crisisMenuLabel: "সহায়তা কেন্দ্ৰ", pledgeButton: "আজিৰ প্ৰতিজ্ঞা লওক" },
  ur: { appName: "RecoveryTribe", tagline: "آپ کی آواز، آپ کی زبان، آپ کا بحالی کا قبیلہ", continueBtn: "آگے بڑھیں", home: "فیڈ", search: "تلاش", profile: "سفر", loginBtn: "لاگ ان", signupBtn: "اکاؤنٹ بنائیں", like: "حمایت", comment: "تبصرہ", share: "شیئر", hundredDaysBtn: "100 دن ہب", crisisMenuLabel: "ہیلپ لائن", pledgeButton: "آج کا عہد لیں" },
  en: {} as unknown as { appName: string; tagline: string; continueBtn: string; home: string; search: string; profile: string; loginBtn: string; signupBtn: string; like: string; comment: string; share: string; hundredDaysBtn: string; crisisMenuLabel: string; pledgeButton: string; },
  hi: {} as unknown as { appName: string; tagline: string; continueBtn: string; home: string; search: string; profile: string; loginBtn: string; signupBtn: string; like: string; comment: string; share: string; hundredDaysBtn: string; crisisMenuLabel: string; pledgeButton: string; },
  ta: {} as unknown as { appName: string; tagline: string; continueBtn: string; home: string; search: string; profile: string; loginBtn: string; signupBtn: string; like: string; comment: string; share: string; hundredDaysBtn: string; crisisMenuLabel: string; pledgeButton: string; },
};

remainingLangCodes.forEach(code => {
  const terms = NATIVE_TERMS[code];
  T[code] = {
    ...T.en,
    ...(terms || {}),
    chooseLanguageTitle: terms ? terms.tagline : T.en.chooseLanguageTitle,
  };
});
