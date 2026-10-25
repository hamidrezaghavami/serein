export type Locale = "en" | "fa";

export const messages = {
  myAccount: ["My account", "حساب من"],
  signIn: ["Sign in", "ورود"],
  signOut: ["Sign out", "خروج"],
  welcomeBack: ["A quiet welcome back.", "خوش آمدید؛ به آرامی بازگردید."],
  joinSerein: ["Make room for your ritual.", "جایی برای آیین مراقبت خود باز کنید."],
  accountIntroduction: ["A little space for your details and daily rituals.", "فضایی کوچک برای اطلاعات شما و آیین‌های مراقبت روزانه."],
  accountLoading: ["Preparing your account…", "در حال آماده‌سازی حساب شما…"],
  signInAccount: ["Sign in to see your profile and saved orders.", "برای دیدن اطلاعات و سفارش‌های ذخیره‌شده وارد شوید."],
  profileDetails: ["Your details", "اطلاعات شما"],
  profileName: ["Display name", "نام نمایشی"],
  profilePhone: ["Phone (optional)", "تلفن (اختیاری)"],
  profileAddress: ["Address (optional)", "نشانی (اختیاری)"],
  saveProfile: ["Save details", "ذخیرهٔ اطلاعات"],
  saving: ["Saving…", "در حال ذخیره…"],
  profileSaved: ["Your details have been saved.", "اطلاعات شما ذخیره شد."],
  manageSignIn: ["Manage email and sign-in settings", "مدیریت ایمیل و تنظیمات ورود"],
  yourOrders: ["Your recent orders", "سفارش‌های اخیر شما"],
  noOrders: ["Your saved orders will appear here.", "سفارش‌های ذخیره‌شدهٔ شما اینجا نمایش داده می‌شوند."],
  accountDemoNote: ["Portfolio demo orders only. No purchases or shipments.", "فقط سفارش‌های نمایشیِ نمونه‌کار. خرید یا ارسال واقعی انجام نمی‌شود."],
  demoConfirmed: ["Demo order confirmed", "سفارش نمایشی ثبت شد"],
  accountSessionError: ["Your session could not be verified. Sign out and sign in again.", "نشست شما تأیید نشد. خارج شوید و دوباره وارد شوید."],
  accountInputError: ["Please check your profile fields and try again.", "اطلاعات فرم را بررسی کنید و دوباره تلاش کنید."],
  accountConnectionError: ["We could not reach your account. Check that the API is running and try again.", "ارتباط با حساب برقرار نشد. روشن بودن سرور را بررسی کنید و دوباره تلاش کنید."],
  retry: ["Try again", "تلاش دوباره"],
  skip: ["Skip to content", "رفتن به محتوای اصلی"],
  home: ["Home", "خانه"],
  notFoundTitle: ["A little off the path.", "کمی از مسیر دور شده‌ایم."],
  notFoundDescription: [
    "We couldn't find this page. Find your way back to the collection.",
    "این صفحه پیدا نشد. از اینجا به مجموعه بازگردید.",
  ],
  shop: ["Shop", "فروشگاه"],
  story: ["Our story", "داستان ما"],
  ritual: ["The ritual", "آیین مراقبت"],
  faq: ["FAQ", "پرسش‌های متداول"],

  mainNav: ["Main navigation", "منوی اصلی"],
  footerNav: ["Footer navigation", "پیوندهای پایین صفحه"],
  breadcrumb: ["Breadcrumb", "مسیر صفحه"],

  openMenu: ["Open menu", "باز کردن منو"],
  closeMenu: ["Close menu", "بستن منو"],
  language: ["Language", "زبان"],
  switchLanguage: ["Switch to Persian", "تغییر زبان به انگلیسی"],

  bag: ["Bag", "سبد خرید"],
  openBag: [
    "Open shopping bag, {count} items",
    "باز کردن سبد خرید، {count} کالا",
  ],
  closeBag: ["Close shopping bag", "بستن سبد خرید"],
  quantity: ["Quantity", "تعداد"],
  add: ["Add to bag", "افزودن به سبد"],
  remove: ["Remove", "حذف"],
  decrease: ["Decrease {name} quantity", "کاهش تعداد {name}"],
  increase: ["Increase {name} quantity", "افزایش تعداد {name}"],

  tagline: ["A quieter kind of care.", "مراقبتی به آرامیِ یک مکث."],

  newsletterTitle: [
    "Stay quietly informed",
    "آرام و بی‌هیاهو، باخبر بمانید",
  ],
  newsletterDemo: [
    "Demo newsletter — no emails collected.",
    "خبرنامهٔ نمایشی؛ هیچ ایمیلی ذخیره نمی‌شود.",
  ],
  emailPlaceholder: ["Your email address", "نشانی ایمیل شما"],
  subscribe: ["Subscribe", "عضویت"],
  newsletterThanks: [
    "Thank you — this is a demo. No email was collected.",
    "سپاس از شما؛ این فرم نمایشی است و ایمیلی ذخیره نشد.",
  ],

  rights: ["All rights reserved.", "تمام حقوق محفوظ است."],
  portfolio: [
    "Fictional skincare brand. Portfolio demo. No purchases or payments.",
    "برندی خیالی برای نمونه‌کار؛ خرید و پرداخت واقعی انجام نمی‌شود.",
  ],
  designed: [
    "Designed as a portfolio project",
    "طراحی‌شده به‌عنوان نمونه‌کار",
  ],

  thankYou: ["Thank you.", "سپاس از شما."],
  checkout: ["Demo checkout", "ثبت سفارش نمایشی"],
  shoppingBag: ["Your shopping bag", "سبد خرید شما"],
  onWay: ["A little care is on its way.", "کمی آرامش در راه است."],
  orderPlaced: [
    "Demo order placed. No payment was collected and nothing will be shipped.",
    "سفارش نمایشی ثبت شد. مبلغی دریافت نشده و کالایی ارسال نمی‌شود.",
  ],
  continueExploring: ["Continue exploring", "ادامهٔ گشت‌وگذار"],
  checkoutIntro: [
    "Demo checkout — no payment will be collected. Use the fictional details below.",
    "ثبت سفارش نمایشی است و پرداختی ندارد. از اطلاعات ساختگی زیر استفاده کنید.",
  ],

  name: ["Name", "نام"],
  email: ["Email", "ایمیل"],
  address: ["Demo address", "نشانی نمایشی"],
  total: ["Total · USD", "مجموع · دلار آمریکا"],
  shipping: [
    "Shipping: $0 · Tax: $0 (simulation)",
    "ارسال: ۰ دلار · مالیات: ۰ دلار (نمایشی)",
  ],
  placeOrder: ["Place demo order", "ثبت سفارش نمایشی"],
  backToBag: ["Back to bag", "بازگشت به سبد"],
  subtotal: ["Subtotal", "جمع سبد"],
  demoOnly: [
    "Demo only. No real purchases or payments.",
    "صرفاً نمایشی؛ خرید یا پرداخت واقعی انجام نمی‌شود.",
  ],
  continueCheckout: [
    "Continue to demo checkout",
    "ادامهٔ ثبت سفارش نمایشی",
  ],
  roomForRitual: [
    "A little room for your ritual.",
    "جایی برای آیین مراقبت شما.",
  ],
  empty: ["Your bag is empty.", "سبد خرید شما خالی است."],
  continueShopping: ["Continue shopping", "ادامهٔ خرید"],

  introducing: ["Introducing SEREIN", "آشنایی با سرن"],
  heroFirst: ["A quieter", "مراقبتی"],
  heroSecond: ["kind of care.", "به آرامیِ یک مکث."],
  heroDescription: [
    "Thoughtfully simple skincare. A daily moment to slow down.",
    "مراقبت از پوست، ساده و سنجیده. لحظه‌ای در روز برای آهسته‌تر زیستن.",
  ],
  shopCollection: ["Shop the collection", "دیدن مجموعه"],
  fiveFormulas: ["5 considered formulations", "۵ فرمول سنجیده"],
  formulas: ["The formulas", "فرمول‌ها"],
  essentials: [
    "Your daily essentials.",
    "ضروری‌های مراقبت روزانهٔ شما.",
  ],
  viewAll: ["View all formulas", "دیدن همهٔ فرمول‌ها"],

  philosophy: ["Philosophy", "نگاه ما"],
  lessNoise: ["Less noise.", "هیاهوی کمتر."],
  moreRitual: ["More ritual.", "مراقبت آگاهانه‌تر."],
  philosophyDescription: [
    "A considered collection of everyday essentials, made for moments of care. A simpler approach to your daily routine, with time to slow down.",
    "مجموعه‌ای سنجیده از ضروری‌های روزانه، برای لحظه‌های مراقبت. نگاهی ساده‌تر به برنامهٔ هر روز؛ با فرصتی برای مکث.",
  ],
  discover: ["Discover SEREIN", "آشنایی با سرن"],

  sequence: ["A thoughtful sequence", "ترتیبی سنجیده"],
  rhythm: ["Find your daily rhythm.", "آهنگ روزانهٔ خود را پیدا کنید."],
  stepsDescription: [
    "Five intentional steps. A little time for yourself.",
    "پنج گام آگاهانه. کمی زمان برای خودتان.",
  ],
  step: ["Step", "گام"],
  formulaId: ["ID", "شماره"],
  cleanse: ["Cleanse", "پاک‌سازی"],
  tone: ["Tone", "متعادل‌سازی"],
  treat: ["Treat", "رسیدگی"],
  moisturize: ["Moisturize", "مرطوب‌سازی"],
  eyeCare: ["Eye care", "مراقبت دور چشم"],

  about: ["About us", "دربارهٔ ما"],
  storyOne: [
    "SEREIN began with a simple idea: everyday care can feel less complicated.",
    "سرن با ایده‌ای ساده آغاز شد: مراقبت روزانه می‌تواند آسان‌تر باشد.",
  ],
  storyTwo: [
    "Our collection brings together a few considered essentials and a slower approach to the daily ritual.",
    "مجموعهٔ ما چند محصول ضروری و سنجیده را با نگاهی آرام‌تر به مراقبت روزانه کنار هم می‌آورد.",
  ],
  storyThree: [
    "From the first cleanse to the final layer of moisture, we make room for small moments of care.",
    "از نخستین پاک‌سازی تا آخرین لایهٔ مرطوب‌کننده، برای لحظه‌های کوچک مراقبت جا باز می‌کنیم.",
  ],
  edition: ["Apothecary edition", "مجموعهٔ آپوتکری"],
  bannerDescription: [
    "A little time. A few essentials. A moment for yourself.",
    "کمی زمان. چند محصول ضروری. لحظه‌ای برای خودتان.",
  ],
  ownPace: ["Care, at your own pace.", "مراقبت، با آهنگ زندگی شما."],
  noPerfect: [
    "There is no perfect routine. Just the one you make your own.",
    "برنامه‌ای بی‌نقص وجود ندارد؛ فقط برنامه‌ای که به سبک خودتان می‌سازید.",
  ],
  explore: ["Explore the collection", "کشف مجموعه"],
  purchaseQuestion: [
    "Can I purchase these products?",
    "آیا می‌توانم این محصولات را بخرم؟",
  ],
  purchaseAnswer: [
    "This is a fictional portfolio store. Checkout is simulated; no payment is collected and no products are shipped.",
    "این فروشگاه خیالی برای نمونه‌کار ساخته شده است. ثبت سفارش نمایشی است؛ پرداختی دریافت نمی‌شود و کالایی ارسال نخواهد شد.",
  ],

  collection: ["The collection", "مجموعه"],
  collectionDescription: [
    "Five considered formulas. Find your daily rhythm.",
    "پنج فرمول سنجیده. آهنگ روزانهٔ خود را پیدا کنید.",
  ],
  formula: ["Formula", "فرمول"],
  fictionalProduct: [
    "Fictional product. Demo purchases only.",
    "محصول خیالی؛ خرید صرفاً نمایشی است.",
  ],
  ritualNote: [
    "Use this fictional product as part of the SEREIN demo routine. Product information is illustrative.",
    "این محصول خیالی بخشی از برنامهٔ نمایشی مراقبت سرن است. اطلاعات محصول جنبهٔ نمونه دارد.",
  ],
  notes: ["Formula notes", "دربارهٔ فرمول"],
  formulaNote: [
    "A portfolio product concept; no verified ingredient list or clinical claims.",
    "ایدهٔ محصول برای نمونه‌کار؛ بدون فهرست تأییدشدهٔ ترکیبات یا ادعاهای بالینی.",
  ],

  viewProduct: ["View {name}", "دیدن {name}"],
  texture: [
    "{name} with skincare texture",
    "{name} همراه با بافت محصول",
  ],
  heroAlt: [
    "Smiling model gently cleansing her face",
    "مدلی خندان در حال شست‌وشوی آرام صورت",
  ],
  portraitAlt: [
    "Natural portrait in warm sunlight",
    "چهره‌ای طبیعی در نور گرم خورشید",
  ],
  aboutAlt: [
    "Two smiling models holding SEREIN skincare",
    "دو مدل خندان با محصولات مراقبت از پوست سرن",
  ],
  ritualAlt: [
    "Hands opening Daily Moisturizer on a stone surface",
    "دست‌هایی در حال باز کردن مرطوب‌کنندهٔ روزانه روی سطح سنگی",
  ],
  skinAlt: [
    "Close-up of serum droplets on naturally textured skin",
    "نمای نزدیک قطره‌های سرم روی بافت طبیعی پوست",
  ],
} as const;

export type MessageKey = keyof typeof messages;