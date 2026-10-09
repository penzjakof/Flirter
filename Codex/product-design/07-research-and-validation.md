# 07. Дослідження, метрики та перевірка

Дата: **04.10.2026**. Проведено кабінетне дослідження первинних платформних, регуляторних і технічних джерел та рекомендацій NN/g. Інтерв’ю з аудиторією, live-аудит акаунтів конкурентів, юзабіліті-тести, експерименти з цінами й перевірка PWA на пристроях **ще не проводилися**. Тому наведені UX-рішення обґрунтовані, але не оголошені доведеними драйверами конверсії.

## 1. Висновки для продукту

| Питання | Висновок із дослідження / обмеження | Прийняте дизайнерське рішення |
|---|---|---|
| Як скоротити onboarding? | Навчання інтерфейсу краще прив’язувати до використання; це не скасовує обов’язкові disclosure | Мінімум полів, optional preferences, контекстні підказки |
| Коли просити push? | Ранній запит без поясненої користі може знижувати довіру | Після цінності й явного tap; конкретний timing тестувати |
| Чи достатньо PWA для push на iPhone? | Потрібні підтримувані версія/контекст, дозвіл і підписка | Окремі install та push flows, browser fallback |
| Як не втрачати акаунт? | Браузерне storage не є незнищенним; cookie/token потребують захисту | Серверні дані, контрольоване renewal, швидкий reauth |
| Чи достатньо AI checkbox? | Розкриття взаємодії та маркування результатів — різні питання | Onboarding + перший чат + місце для provenance медіа |
| Чи достатньо DOB для NSFW? | Age declaration не тотожна age assurance | Умовний провайдерський flow до захищеного контенту |
| Як продавати енергію? | Ігрова валюта не повинна приховувати реальну ціну | Прозорі тарифи, review покупки, ledger та зрозумілий refund |
| Чи можна просто взяти стандартний checkout? | Adult AI-контент може порушувати правила провайдера | Вибір еквайра перед деталізацією методів оплати |

Це синтез джерел і брифу. Чотири вкладки, кольори, 20 стартових одиниць, 30/60 ліміти, моменти upsell, cooldown і частотні обмеження — авторські рекомендації/гіпотези, а не цитати або результати A/B-тесту.

## 2. Реєстр джерел

Усі посилання перевірялися в межах дослідження; закони й платформні можливості повторно звірити перед запуском. Нижче — джерела, на які спирається специфікація, без неперевірених статистичних обіцянок.

### Платформа, безпека та performance

| Джерело | Використання |
|---|---|
| [WebKit: Web Push for Web Apps on iOS/iPadOS](https://webkit.org/blog/13878/web-push-for-web-apps-on-ios-and-ipados/) | Home Screen Web Push, user gesture, manifest |
| [Apple: Sending Web Push](https://developer.apple.com/documentation/usernotifications/sending-web-push-notifications-in-web-apps-and-browsers) | Межі підтримки Apple |
| [WebKit: Updates to Storage Policy](https://webkit.org/blog/14403/updates-to-storage-policy/) | Storage quotas/eviction, відсутність гарантії локальної схоронності |
| [web.dev: Installation](https://web.dev/learn/pwa/installation/) | Відмінності встановлення між платформами |
| [web.dev: Installation prompt](https://web.dev/learn/pwa/installation-prompt/) | Прогресивне використання браузерного prompt; окремі старі приклади перевіряти на поточних браузерах |
| [OWASP: Session Management](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html) | Захист cookie, відмова від токенів у JS storage, session lifecycle |
| [web.dev: Web Vitals](https://web.dev/articles/vitals) | Польові цілі LCP/INP/CLS |
| [Expo SDK 57](https://docs.expo.dev/versions/v57.0.0/) | Версійний контекст наявного package.json |
| [Expo llms.txt](https://docs.expo.dev/llms.txt) та [PWA guide](https://docs.expo.dev/guides/progressive-web-apps/) | Актуальна точка входу до реалізації web/PWA |

### UX і доступність

| Джерело | Використання |
|---|---|
| [NN/g: Mobile-App Onboarding](https://www.nngroup.com/articles/mobile-app-onboarding/) | Контекстне навчання й зменшення зайвих стартових кроків |
| [NN/g: Five Mistakes in Designing Mobile Push Notifications](https://www.nngroup.com/articles/push-notification/) | Запит дозволу після пояснення цінності |
| [W3C: WCAG 2.2](https://www.w3.org/TR/WCAG22/) | Доступність, контраст, керованість і розміри цілей |

### Право й правила провайдерів

| Джерело | Використання / межі |
|---|---|
| [Єврокомісія: Article 50 FAQ](https://digital-strategy.ec.europa.eu/en/faqs/transparency-obligations-under-article-50-ai-act) | AI disclosure, маркування й строки; ролі визначаються окремо |
| [GDPR — офіційний текст](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A32016R0679) | Застосовність, privacy, права, передача й захист даних |
| [EDPB: Process personal data lawfully](https://www.edpb.europa.eu/sme/be-compliant/process-personal-data-lawfully_en) | Правові підстави й special-category processing |
| [EDPB: Age Assurance, Statement 1/2025](https://www.edpb.europa.eu/our-work-tools/our-documents/statements/statement-12025-age-assurance_en) | Мінімізація й пропорційність перевірки віку |
| [CNIL: Cookies FAQ](https://www.cnil.fr/fr/cookies-et-autres-traceurs/regles/cookies/FAQ) | Приклад французької наглядової практики, не універсальний текст для всіх держав |
| [Єврокомісія: In-game virtual currencies](https://commission.europa.eu/news-and-media/news/european-commission-hosts-stakeholders-talks-application-cpc-networks-key-principles-games-virtual-2025-06-03_en) | Позиція CPC щодо прозорості та consumer protection |
| [Your Europe: Distance selling](https://europa.eu/youreurope/business/selling-in-eu/selling-goods-services/ecommerce-distance-selling/index_en.htm) | Pre-contract information та дистанційні договори |
| [Your Europe: Withdrawal](https://europa.eu/youreurope/citizens/consumers/shopping/returns/indexamp_en.htm) | Право відмови й умовні винятки |
| [Your Europe: Accessibility](https://europa.eu/youreurope/business/selling-in-eu/selling-goods-services/accessibility/index_en.htm) | EAA та застосовність до послуг |
| [Україна: Закон №2297-VI](https://zakon.rada.gov.ua/laws/show/2297-17) | Персональні й чутливі дані |
| [Україна: Закон №675-VIII](https://zakon.rada.gov.ua/laws/main/675-19) | Електронна комерція |
| [Україна: Кримінальний кодекс](https://zakon.rada.gov.ua/laws/show/2341-14?lang=en) | Контентні обмеження; повна перевірка чинної української редакції ще потрібна |
| [Ofcom: Age checks](https://www.ofcom.org.uk/online-safety/protecting-children/age-checks-to-protect-children-online?language=en) | Британський умовний сценарій; не підміняє правила ЄС/України |
| [Stripe: Restricted businesses](https://stripe.com/legal/restricted-businesses) | Правила конкретного провайдера, не закон і не підтвердження доступності інших |

## 3. Метрики без прихованого збору інтимних даних

**Основна продуктова метрика, гіпотеза:** кількість користувачів на тиждень, які мали завершену розмовну сесію, наприклад щонайменше три обміни user→AI. Це proxy корисності, а не доказ романтичного задоволення; поріг уточнити після якісного дослідження.

| Воронка | Події / визначення | Захисний показник |
|---|---|---|
| Активація | welcome → age eligible → auth → disclosure saved → first send → first completed reply | Зрозумілість AI, відмови, помилки входу |
| Спілкування | Користувачі з ≥1/≥3 завершеними обмінами, час до першої відповіді | AI failure, refund енергії, reports |
| Монетизація | Shop view → checkout start → verified purchase; paid conversion серед eligible activated users | Refund/chargeback, payment pending, скарги на ціну |
| VIP | Activated subscription → успішний renewal / cancel | Успішність самостійного скасування, небажані renewal |
| PWA | Install explanation shown → install action → перший authenticated standalone launch | Втрата login/context при переході |
| Push | Eligible prompt → browser granted → server subscription active → відкриття актуальної події | Deny/opt-out, spam complaints, duplicate pushes |
| Повернення | D1/D7/D30 для когорт activation; browser і PWA окремо | Частка unexpected reauth та lost-context |

Не називати `install_action` фактом установки, redirect — успішною оплатою, `permission_granted` — доставкою push. D7 retention визначити явно, наприклад активність на сьомий календарний день у прийнятому timezone; не змішувати його з будь-яким поверненням за тиждень.

Події містять мінімальні технічні поля: pseudonymous ID, timestamp, platform/display mode, flow step, result/error class, approved pricing version. Без тексту повідомлень, фото, голосу, сексуальних preferences, DOB або іменного push payload. Маркетингове вимірювання — лише за потрібного дозволу; операційні метрики теж потребують визначеної підстави й retention.

## 4. План юзабіліті-перевірки

Почати з 5–8 повнолітніх учасників на якісну ітерацію, окремо iPhone і Android; це гіпотеза організації тесту, не статистично репрезентативне дослідження. Не просити надавати інтимні матеріали; використовувати безпечний demo-контент.

Завдання:

1. Пояснити своїми словами, хто персонажі та чи можливе реальне побачення.
2. Пройти onboarding, пропустивши гендер/preferences.
3. Обрати персонажа й надіслати текст, voice, sticker і фото.
4. До натискання назвати вартість повідомлення й генерації фото.
5. При дефіциті знайти і платний, і безкоштовний шлях продовження.
6. Розрізнити one-time пакет і recurring VIP, знайти скасування.
7. Додати PWA, відкрити з іконки й повернутися до того самого акаунту.
8. Відмовитися від push/analytics, не втрачаючи базових функцій.
9. Знайти report, очистити чат і почати видалення тестового акаунту.

Фіксувати завершення без підказок, помилки, повернення назад, нерозуміння ціни/AI та місця недовіри. Критичні помилки: користувач сприймає персонажа як реальну людину; випадково купує підписку; не знаходить скасування; губить акаунт; не бачить ціну дії.

## 5. Експерименти після працездатного baseline

| Гіпотеза | Варіанти | Основна метрика | Умова відхилення |
|---|---|---|---|
| Install краще після цінності | Перша розмова / другий візит | Authenticated standalone adoption + D7 | Зростають login failures або early exits |
| Прямий CTA прискорює старт | Like→match / «Почати чат» у профілі | First completed reply | Користувачі гірше розуміють продукт |
| Конкретний контекст допомагає купівлі | Дефіцит + мінімальний пакет / загальний shop | Verified purchase | Більше refunds/скарг/надлишкового залишку |
| Starter energy достатньо для цінності | Узгоджені бюджетом стартові баланси | Activation і D7 | Неприйнятна собівартість чи ранній paywall |

Не тестувати приховування AI, підроблену соціальну активність, навмисне ускладнення відмови/скасування або обхід вікового контролю. Для кількісних тестів заздалегідь визначити вибірку, мінімально значущий ефект, період і guardrails; не заявляти перемогу на кількох покупках.

## 6. Definition of ready для наступного етапу дизайну

- Узгоджені бренд/мова та основний візуальний напрям.
- Визначені країни, оператор, вид NSFW і conditional age flow.
- Затверджена таблиця всіх тарифів, правила резерву/повернення та VIP.
- Підтверджено провайдерів і права на assets.
- Погоджені принципи sensitive-data processing і довготривалого login.
- S01–S45 покриті прототипом відповідно до P0/P1; нема dead-end для browser-only користувача.

## 7. Definition of done для майбутньої реалізації

Усі критичні F01–F18 проходять у погодженій device-матриці. Окремо перевірено idempotent send/payment, server balance, повернення з checkout, browser→PWA login, denied push, offline recovery, subscriptions cancellation і data deletion. Accessibility та performance виміряні, юридичний і контентний процеси готові. Лише після цього можна стверджувати, що функції реалізовані; наявність цього документа підтверджує готовність специфікації, не застосунку.
