import { useSyncExternalStore } from "react";

export type Language = "en" | "hi" | "mr";

const translations = {
  en: {
    dashboard: "Dashboard",
apiaries: "Apiaries",
hives: "My Hives",
    registerHoney: "Register Honey",
    qrCodes: "My QR Codes",
    alerts: "Alerts",
    customerView: "Customer view",
    beekeeperHome: "Beekeeper home",
    welcome: "Welcome",
    manageBeekeeping: "Manage your beekeeping in a few simple steps.",
    addManageHives: "Add and manage your bee hives.",
    registerBatch: "Register a newly harvested honey batch.",
    viewQRCodes: "View QR codes for your registered honey.",
    importantAlerts: "See important hive warnings and updates.",
    language: "Language",
      quickActions: "Quick actions",
      whatWouldYouLike: "What would you like to do?",
      hivesInspections: "Hives & inspections",
      addHive: "Add hive",
      noHives: "No hives on the ledger yet",
      addColony: "Add a colony to start keeping its story.",
      colony: "Colony",
      apiary: "Apiary",
      strength: "Strength",
      health: "Health",
      yield: "Yield",
      inspect: "Inspect",
      addAHive: "Add a hive",
      hiveName: "Hive name",
      chooseApiary: "Choose an apiary",
      frames: "Frames",
      queenAge: "Queen age (years)",
      inspection: "Log an inspection",
      inspectionDate: "Inspection date",
      colonyCondition: "Colony condition",
      colonyStrength: "Colony strength",
      notes: "Notes",
      whatDidYouNotice: "What did you notice?",
      saveInspection: "Save inspection",
      harvest: "Harvest",
      recordHarvest: "Record harvest",
      firstHarvest: "The first harvest is waiting",
      logHarvest: "Log quantity, weather, and floral source while the day is still fresh.",
      recordAHarvest: "Record a harvest",
      hive: "Hive",
      chooseHive: "Choose a hive",
      harvestDate: "Harvest date",
      quantityKg: "Quantity (kg)",
      floralSource: "Floral source",
      weather: "Weather",
        batchesTitle: "Honey batches",
        batchesDetail: "The unit of trust. Each batch gathers a harvest, its origin, and the events that follow.",
        createBatch: "Create batch",
        noBatches: "No batches yet",
        noBatchesDetail: "Create a batch from an existing hive to start a traceable thread.",
        qrCodesTitle: "My QR codes",
        qrCodesDetail: "Open a registered batch to view its existing customer QR payload.",
        qualityTitle: "Quality verification",
        qualityDetail: "Make the invisible measurable. Capture the tests that let a customer trust the label.",
        processingTitle: "Processing & packaging",
        processingDetail: "Document the moment raw harvest becomes the jar your customer takes home.",
        supplyChainTitle: "Supply chain",
        supplyChainDetail: "Keep the path visible from extractor to market, one honest handoff at a time.",
        blockchainTitle: "Ledger explorer",
        blockchainDetail: "An append-only view of the chain. Verify its shape, then inspect every link.",
        verifyChain: "Verify chain",
        publicPassport: "Public honey passport",
        passportUnavailable: "That passport is not available",
        passportUnavailableDetail: "Check the batch code and try once more.",
        backHome: "Back home",
  },

  hi: {
    dashboard: "डैशबोर्ड",
apiaries: "मधुमक्खी पालन क्षेत्र",
hives: "मेरी मधुमक्खी पेटियाँ",
    registerHoney: "शहद पंजीकृत करें",
    qrCodes: "मेरे QR कोड",
    alerts: "सूचनाएँ",
    customerView: "ग्राहक दृश्य",
    beekeeperHome: "मधुमक्खी पालक होम",
    welcome: "स्वागत है",
    manageBeekeeping: "कुछ आसान चरणों में अपनी मधुमक्खी पालन गतिविधि प्रबंधित करें।",
    addManageHives: "अपनी मधुमक्खी पेटियाँ जोड़ें और प्रबंधित करें।",
    registerBatch: "नए प्राप्त शहद बैच को पंजीकृत करें।",
    viewQRCodes: "अपने पंजीकृत शहद के QR कोड देखें।",
    importantAlerts: "महत्वपूर्ण चेतावनियाँ और अपडेट देखें।",
    language: "भाषा",
      quickActions: "त्वरित कार्य",
      whatWouldYouLike: "आप क्या करना चाहते हैं?",
      hivesInspections: "मधुमक्खी पेटियाँ और निरीक्षण",
      addHive: "पेटी जोड़ें",
      noHives: "अभी तक कोई मधुमक्खी पेटी नहीं है",
      addColony: "अपनी कॉलोनी की जानकारी रखने के लिए एक कॉलोनी जोड़ें।",
      colony: "कॉलोनी",
      apiary: "मधुमक्खी पालन क्षेत्र",
      strength: "मजबूती",
      health: "स्वास्थ्य",
      yield: "उत्पादन",
      inspect: "निरीक्षण",
      addAHive: "मधुमक्खी पेटी जोड़ें",
      hiveName: "पेटी का नाम",
      chooseApiary: "मधुमक्खी पालन क्षेत्र चुनें",
      frames: "फ्रेम",
      queenAge: "रानी मधुमक्खी की आयु (वर्ष)",
      inspection: "निरीक्षण दर्ज करें",
      inspectionDate: "निरीक्षण की तारीख",
      colonyCondition: "कॉलोनी की स्थिति",
      colonyStrength: "कॉलोनी की मजबूती",
      notes: "टिप्पणियाँ",
      whatDidYouNotice: "आपने क्या देखा?",
      saveInspection: "निरीक्षण सहेजें",
      harvest: "शहद संग्रह",
      recordHarvest: "संग्रह दर्ज करें",
      firstHarvest: "पहला शहद संग्रह अभी बाकी है",
      logHarvest: "दिन ताज़ा रहते मात्रा, मौसम और फूलों के स्रोत की जानकारी दर्ज करें।",
      recordAHarvest: "शहद संग्रह दर्ज करें",
      hive: "मधुमक्खी पेटी",
      chooseHive: "मधुमक्खी पेटी चुनें",
      harvestDate: "संग्रह की तारीख",
      quantityKg: "मात्रा (किग्रा)",
      floralSource: "फूलों का स्रोत",
      weather: "मौसम",
        batchesTitle: "शहद के बैच",
        batchesDetail: "विश्वास की इकाई। हर बैच में संग्रह, स्रोत और आगे की घटनाएँ शामिल होती हैं।",
        createBatch: "बैच बनाएँ",
        noBatches: "अभी कोई बैच नहीं",
        noBatchesDetail: "पता लगाने योग्य प्रक्रिया शुरू करने के लिए मौजूदा पेटी से बैच बनाएँ।",
        qrCodesTitle: "मेरे QR कोड",
        qrCodesDetail: "ग्राहक के QR विवरण को देखने के लिए पंजीकृत बैच खोलें।",
        qualityTitle: "गुणवत्ता सत्यापन",
        qualityDetail: "अदृश्य को मापने योग्य बनाएँ। लेबल पर भरोसा बढ़ाने वाली जाँच दर्ज करें।",
        processingTitle: "प्रसंस्करण और पैकेजिंग",
        processingDetail: "कच्चा संग्रह ग्राहक के घर पहुँचने वाले जार में बदलने का क्षण दर्ज करें।",
        supplyChainTitle: "आपूर्ति श्रृंखला",
        supplyChainDetail: "निकासी से बाजार तक का रास्ता हर ईमानदार हस्तांतरण के साथ स्पष्ट रखें।",
        blockchainTitle: "लेजर एक्सप्लोरर",
        blockchainDetail: "श्रृंखला का केवल-जोड़ने योग्य दृश्य। इसका आकार सत्यापित करें और हर कड़ी देखें।",
        verifyChain: "श्रृंखला सत्यापित करें",
        publicPassport: "सार्वजनिक शहद पासपोर्ट",
        passportUnavailable: "यह पासपोर्ट उपलब्ध नहीं है",
        passportUnavailableDetail: "बैच कोड जाँचें और फिर प्रयास करें।",
        backHome: "होम पर लौटें",
  },

  // @ts-ignore Duplicate phrase entries intentionally resolve to the same translation.
  mr: {
    // @ts-ignore Duplicate phrase entries intentionally resolve to the same translation.
    dashboard: "डॅशबोर्ड",
apiaries: "मधमाशी पालन क्षेत्र",
hives: "माझ्या मधमाशी पेट्या",
    registerHoney: "मध नोंदणी करा",
    qrCodes: "माझे QR कोड",
    alerts: "सूचना",
    customerView: "ग्राहक दृश्य",
    beekeeperHome: "मधमाशी पालक होम",
    welcome: "स्वागत आहे",
    manageBeekeeping: "काही सोप्या चरणांमध्ये तुमचे मधमाशी पालन व्यवस्थापित करा.",
    addManageHives: "तुमच्या मधमाशी पेट्या जोडा आणि व्यवस्थापित करा.",
    registerBatch: "नवीन मिळालेल्या मधाच्या बॅचची नोंदणी करा.",
    viewQRCodes: "नोंदणीकृत मधाचे QR कोड पहा.",
    importantAlerts: "महत्त्वाच्या सूचना आणि अपडेट्स पहा.",
    language: "भाषा",
      quickActions: "जलद कृती",
      whatWouldYouLike: "तुम्हाला काय करायचे आहे?",
      hivesInspections: "मधमाशी पेट्या आणि तपासणी",
      addHive: "पेटी जोडा",
      noHives: "अजून कोणतीही मधमाशी पेटी नोंदलेली नाही",
      addColony: "तुमच्या कॉलनीची माहिती ठेवण्यासाठी एक कॉलनी जोडा.",
      colony: "कॉलनी",
      apiary: "मधमाशी पालन क्षेत्र",
      strength: "मजबूती",
      health: "आरोग्य",
      yield: "उत्पादन",
      inspect: "तपासणी",
      addAHive: "मधमाशी पेटी जोडा",
      hiveName: "पेटीचे नाव",
      chooseApiary: "मधमाशी पालन क्षेत्र निवडा",
      frames: "फ्रेम",
      queenAge: "राणी मधमाशीचे वय (वर्षे)",
      inspection: "तपासणी नोंदवा",
      inspectionDate: "तपासणीची तारीख",
      colonyCondition: "कॉलनीची स्थिती",
      colonyStrength: "कॉलनीची मजबूती",
      notes: "नोंदी",
      whatDidYouNotice: "तुमच्या लक्षात काय आले?",
      saveInspection: "तपासणी जतन करा",
      harvest: "मध संकलन",
      recordHarvest: "संकलन नोंदवा",
      firstHarvest: "पहिले मध संकलन अजून बाकी आहे",
      logHarvest: "दिवस ताजा असतानाच मात्रा, हवामान आणि फुलांच्या स्रोताची माहिती नोंदवा.",
      recordAHarvest: "मध संकलन नोंदवा",
      hive: "मधमाशी पेटी",
      chooseHive: "मधमाशी पेटी निवडा",
      harvestDate: "संकलनाची तारीख",
      quantityKg: "प्रमाण (किलो)",
      floralSource: "फुलांचा स्रोत",
      weather: "हवामान",
      batchesTitle: "मधाचे बॅच",
      batchesDetail: "विश्वासाची एकक. प्रत्येक बॅचमध्ये संकलन, स्रोत आणि त्यानंतरच्या घटना असतात.",
      createBatch: "बॅच तयार करा",
      noBatches: "अजून कोणतेही बॅच नाहीत",
      noBatchesDetail: "ट्रेस करण्यायोग्य प्रक्रिया सुरू करण्यासाठी विद्यमान पेटीतून बॅच तयार करा.",
      qrCodesTitle: "माझे QR कोड",
      qrCodesDetail: "ग्राहकाचा QR तपशील पाहण्यासाठी नोंदणीकृत बॅच उघडा.",
      qualityTitle: "गुणवत्ता पडताळणी",
      qualityDetail: "अदृश्य गोष्टी मोजण्यायोग्य करा. लेबलवर ग्राहकाचा विश्वास वाढवणाऱ्या चाचण्या नोंदवा.",
      processingTitle: "प्रक्रिया आणि पॅकेजिंग",
      processingDetail: "कच्चे संकलन ग्राहक घरी घेऊन जाणाऱ्या बरणीत बदलण्याचा क्षण नोंदवा.",
      supplyChainTitle: "पुरवठा साखळी",
      supplyChainDetail: "उत्पादकापासून बाजारापर्यंतचा मार्ग प्रत्येक प्रामाणिक हस्तांतरणासह स्पष्ट ठेवा.",
      blockchainTitle: "लेजर एक्सप्लोरर",
      blockchainDetail: "साखळीचे फक्त-जोडता येणारे दृश्य. तिची रचना तपासा आणि प्रत्येक दुवा पाहा.",
      verifyChain: "साखळी पडताळा",
      publicPassport: "सार्वजनिक मध पासपोर्ट",
      passportUnavailable: "हे पासपोर्ट उपलब्ध नाही",
      passportUnavailableDetail: "बॅच कोड तपासा आणि पुन्हा प्रयत्न करा.",
      backHome: "मुख्यपृष्ठावर परत जा",
  },
} as const;

const textKeys: Record<string, keyof typeof translations.en> = {
  "Honey batches": "batchesTitle",
  "The unit of trust. Each batch gathers a harvest, its origin, and the events that follow.": "batchesDetail",
  "My QR codes": "qrCodesTitle",
  "Open a registered batch to view its existing customer QR payload.": "qrCodesDetail",
  "Quality verification": "qualityTitle",
  "Make the invisible measurable. Capture the tests that let a customer trust the label.": "qualityDetail",
  "Processing & packaging": "processingTitle",
  "Document the moment raw harvest becomes the jar your customer takes home.": "processingDetail",
  "Supply chain": "supplyChainTitle",
  "Keep the path visible from extractor to market, one honest handoff at a time.": "supplyChainDetail",
  "Ledger explorer": "blockchainTitle",
  "An append-only view of the chain. Verify its shape, then inspect every link.": "blockchainDetail",
  "Public honey passport": "publicPassport",
};

const phraseTranslations: Record<Language, Record<string, string>> = {
  en: {},
  hi: {
    "Honey Chain": "हनी चेन", "Chain is humming": "चेन सक्रिय है", "Every field note becomes a thread your customers can trust.": "हर फील्ड नोट आपके ग्राहकों के भरोसे की एक कड़ी बनता है।", "Close navigation": "नेविगेशन बंद करें", "Field notebook": "फील्ड नोटबुक", "Customer view": "ग्राहक दृश्य", English: "अंग्रेज़ी", "How it works": "यह कैसे काम करता है", "Honey Passport": "हनी पासपोर्ट", "Sign in": "साइन इन", "Start your apiary": "अपना मधुमक्खी पालन क्षेत्र शुरू करें", "Traceability for the living world": "जीवंत दुनिया के लिए ट्रेस करने योग्य जानकारी", "Every jar has a story.": "हर जार की एक कहानी है।", "Verify a jar": "जार सत्यापित करें", "field records": "फील्ड रिकॉर्ड", "apiaries in bloom": "फूलों से भरे पालन क्षेत्र", "Add record": "रिकॉर्ड जोड़ें", "Add the first record": "पहला रिकॉर्ड जोड़ें", "The notebook could not be opened.": "नोटबुक नहीं खुल सकी।", "Check your connection and try again. Your records are safe.": "अपना कनेक्शन जाँचें और फिर प्रयास करें। आपके रिकॉर्ड सुरक्षित हैं।", "Try again": "फिर प्रयास करें", "New field note": "नया फील्ड नोट", "Save field note": "फील्ड नोट सहेजें", "hives": "मधुमक्खी पेटियाँ", "floral sources": "फूलों के स्रोत", "frames": "फ्रेम", "Inspect": "निरीक्षण", "Apiary name": "पालन क्षेत्र का नाम", "Hive count": "पेटियों की संख्या", "Bee species": "मधुमक्खी की प्रजाति", "Calm": "शांत", "Active": "सक्रिय", "Agitated": "व्याकुल", "Weak": "कमज़ोर", "Strong": "मजबूत", "Diseased": "बीमार", "Steady": "स्थिर", "Recorded": "दर्ज", "Pending": "लंबित", "Unknown apiary": "अज्ञात पालन क्षेत्र", "Choose a batch": "बैच चुनें", "Choose a hive": "मधुमक्खी पेटी चुनें", "harvest volume": "संग्रह मात्रा", "Open batch passport and QR payload": "बैच पासपोर्ट और QR विवरण खोलें", "No QR codes yet": "अभी कोई QR कोड नहीं", "Register a honey batch first. Its customer QR payload will appear here.": "पहले शहद बैच पंजीकृत करें। उसका ग्राहक QR विवरण यहाँ दिखाई देगा।", "No movement recorded": "कोई आवाजाही दर्ज नहीं", "The story continues when a batch changes hands.": "बैच के हाथ बदलने पर कहानी आगे बढ़ती है।", "Block history": "ब्लॉक इतिहास", "The ledger is waiting": "लेजर प्रतीक्षा कर रहा है", "Append your first harvest or batch event to see the chain.": "चेन देखने के लिए अपना पहला संग्रह या बैच इवेंट जोड़ें।", "Corrections stay visible": "सुधार दिखाई देते रहते हैं", "Append correction": "सुधार जोड़ें", "Transaction ID": "लेन-देन ID", "Reason for correction": "सुधार का कारण", "All batches": "सभी बैच", "Origin record": "मूल रिकॉर्ड", "Trace events": "ट्रेस इवेंट", "Batch details": "बैच विवरण", "Quality & care": "गुणवत्ता और देखभाल", "Leave a note for the keeper": "पालक के लिए टिप्पणी छोड़ें", "How did it land?": "आपको यह कैसा लगा?", "Thank you for tasting closely.": "ध्यान से स्वाद लेने के लिए धन्यवाद।", "Your note has been added to this passport.": "आपकी टिप्पणी इस पासपोर्ट में जोड़ दी गई है।", "Share feedback": "प्रतिक्रिया साझा करें", "Overall": "कुल मिलाकर", "Taste": "स्वाद", "Quality": "गुणवत्ता", "Production data will take shape after your first harvest.": "आपके पहले संग्रह के बाद उत्पादन डेटा का स्वरूप दिखाई देगा।", "By floral source": "फूलों के स्रोत के अनुसार", "Season conditions": "मौसम की स्थितियाँ", "Run forecast": "पूर्वानुमान चलाएँ", "Confidence": "विश्वसनीयता", "Your profile": "आपकी प्रोफ़ाइल", "Not added": "जोड़ा नहीं गया", "Role": "भूमिका", "Sign out of Honey Chain": "हनी चेन से साइन आउट करें", "Blockchain verification": "ब्लॉकचेन सत्यापन", "Checking blockchain proof...": "ब्लॉकचेन प्रमाण जाँचा जा रहा है...", "Blockchain verified": "ब्लॉकचेन सत्यापित", "Transaction hash": "लेन-देन हैश", "Contract address": "कॉन्ट्रैक्ट पता", "Copy transaction hash": "लेन-देन हैश कॉपी करें", "404 Page Not Found": "404 पेज नहीं मिला", "Did you forget to add the page to the router?": "क्या आप पेज को राउटर में जोड़ना भूल गए?"
  },
  mr: {
  },
};

export function getLanguage(): Language {
  if (typeof window === "undefined") return "en";

  const saved = localStorage.getItem("honeychain-language");

  if (saved === "hi" || saved === "mr") {
    return saved;
  }

  return "en";
}

const languageListeners = new Set<() => void>();

export function setLanguage(language: Language): void {
  if (typeof window === "undefined") return;

  localStorage.setItem("honeychain-language", language);
  languageListeners.forEach((listener) => listener());
}

export function translateText(value: string): string {
  const key = textKeys[value];
  return key ? t(key) : phraseTranslations[getLanguage()][value] ?? value;
}

export function useLanguage(): Language {
  return useSyncExternalStore(
    (listener) => {
      languageListeners.add(listener);
      return () => languageListeners.delete(listener);
    },
    getLanguage,
    () => "en",
  );
}

export function t(key: keyof typeof translations.en): string {
  const language = getLanguage();

  return translations[language][key] ?? translations.en[key] ?? key;
}