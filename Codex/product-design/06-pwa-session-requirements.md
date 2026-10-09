# 06. Мобільний web, PWA, push та збереження входу

Це вимоги до майбутньої реалізації й перевірки, **не опис уже працюючої інтеграції**. Досліджено 04.10.2026. Батьківський проєкт використовує Expo SDK 57; перевірено [versioned reference](https://docs.expo.dev/versions/v57.0.0/), [індекс документації](https://docs.expo.dev/llms.txt) та [Expo PWA guide](https://docs.expo.dev/guides/progressive-web-apps/).

## 1. Продуктовий контракт

1. Основна браузерна версія на телефоні повноцінна без install.
2. Standalone-версія має ті самі account_id, чати, energy ledger і підписку на сервері.
3. Перезапуск не завершує сеанс без підстави; відсутність мережі не дорівнює logout.
4. Встановлення, login і push permission — три різні процеси з різними статусами.
5. Неможливо гарантувати безстроковий вхід після очищення даних, private browsing, відкликання сесії чи дій ОС. UX має швидко відновлювати доступ до того самого акаунту.

## 2. Матриця платформ

| Середовище | Встановлення | Push | Рекомендований UX |
|---|---|---|---|
| iPhone, Safari у вкладці | Інструкція додавання на Home Screen | Для цільового iOS-сценарію потрібен підтримуваний Home Screen web app | Спочатку користь, потім S23 |
| iPhone, Home Screen | Уже standalone | Web Push від iOS/iPadOS 16.4, за підтримки й дозволу | S24 після tap, перевірка subscription |
| Android, підтримуваний Chromium | Системний prompt, якщо браузер надає його; інакше menu instructions | Залежить від browser/API/permission; install не завжди потрібний | Feature detection, optional install |
| Інший Android/browser | Залежить від реалізації | Не припускати наявність | Продовжити в браузері, capability-specific help |
| In-app browser месенджера | Може бути недоступне | Може бути недоступне | Відкрити/скопіювати адресу для підтримуваного браузера |
| Private mode / managed device | Можливі обмеження | Можливі обмеження | Чесне пояснення без блокування базового UX |

WebKit документує Home Screen Web Push та необхідність прямої дії користувача для permission. Новіші реалізації додають можливості, але baseline слід перевіряти capability-детекцією. Джерела: [WebKit — Web Push](https://webkit.org/blog/13878/web-push-for-web-apps-on-ios-and-ipados/), [Apple — sending Web Push](https://developer.apple.com/documentation/usernotifications/sending-web-push-notifications-in-web-apps-and-browsers).

`beforeinstallprompt` не універсальний стандартний UX усіх браузерів. Використовувати подію лише коли вона доступна, не малювати фальшивий системний dialog. iOS-інструкції мають відповідати фактичній версії меню; не фіксувати назавжди позицію Share внизу екрана. [web.dev — installation](https://web.dev/learn/pwa/installation/), [installation prompt](https://web.dev/learn/pwa/installation-prompt/).

## 3. Оболонка й оновлення

Рекомендований контракт: HTTPS, коректний web manifest зі стабільними id/scope/start_url, іконками, app name, theme/background colors та standalone display; deep routes обслуговуються напряму сервером. Service worker забезпечує потрібні web-функції й контрольований shell fallback. Конкретну конфігурацію узгодити з Expo SDK 57 і hosting.

Кешувати публічний shell та статичні assets. Приватні API, чати, media, DOB, токени, billing і consent endpoints не включати в generic cache-first. Вибране локальне зберігання приватних даних — окреме рішення із загрозами, строками та очищенням, не default PWA-властивість.

Web storage може бути видалений через storage pressure або політики браузера; persistent storage не обіцяти як гарантію. Account, purchases, messages і generation jobs мають бути на backend. [WebKit — storage policy](https://webkit.org/blog/14403/updates-to-storage-policy/).

Оновлення оболонки не перезапускає активний recording/payment/send. Показати update notice після безпечної точки; міграція кешу не видаляє auth cookie. Не змішувати OTA native builds із вебдеплоєм як одним механізмом доставки.

## 4. Сесія: рекомендована модель

**Дизайн-рішення:** same-origin frontend + backend/BFF, серверна сесія або короткий access-сеанс із контрольованим renewal. Для бажаної довготривалої авторизації — захищений механізм remember-device/renewal із відкликанням, а не нескінченний bearer token.

Cookie: HttpOnly, Secure, максимально вузький scope, відповідний SameSite; `Lax` може бути потрібний для сумісного top-level auth/payment return, точне значення перевірити для provider callback. CSRF-захист потрібний окремо. Не зберігати refresh/access tokens у localStorage або URL. Базові security-принципи: [OWASP Session Management](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html).

**Продуктова гіпотеза строків, не рекомендація OWASP:** trusted-device renewal до 30 днів неактивності з абсолютною межею 90 днів; фінальні TTL, rotation та reauthentication визначає security review. На особистому пристрої після входу пояснити «Вхід збережено на цьому пристрої»; дати logout і керування іншими сеансами. Sensitive/account/billing-операції можуть вимагати step-up навіть при активній сесії.

Мережевий автомат станів:

```text
boot → checking → authenticated
                → renewing → authenticated
                → offline/server_unavailable → retry (без logout)
                → confirmed_expired/revoked → reauthenticate → return route
                → account_restricted → обмежений доступ + support/rights
```

Вимоги реалізації, які слід перевірити:

- Одне узгоджене renewal при кількох паралельних API-запитах; гонка вкладок не відкликає валідну сесію випадково.
- Вихід і зміна ключових credentials відкликають відповідні серверні сесії; push endpoint більше не отримує приватні події цього акаунту.
- Auth errors відрізняються від 403 scope/region, 429, offline та 5xx.
- Під час bootstrap немає короткого показу чужої/попередньої історії.
- Return route із allowlist, без open redirect і без токенів/інтимного змісту в URL.
- Чернетки іншого account_id не відновлюються після account switch.

## 5. Browser → Home Screen без втрати акаунту

Не покладатися на універсальне спільне сховище cookie/IndexedDB між Safari, іншими браузерами й установленими web apps: поведінка залежить від версії та контексту. Навіть якщо конкретна система переносить login при install, потрібен fallback.

Перший standalone launch → S25. Якщо сесія є — продовжити. Якщо немає — той самий email-код/соціальний login у цьому контексті. Не створювати нову identity через іншу install ID. Для email рекомендовано код, який можна вставити у PWA: magic link може відкриватися в іншому браузері й сам по собі не підтвердить потрібний контекст.

Після reauth backend відновлює історію й баланс. Можливий майбутній transfer-flow тільки через одноразовий, короткоживучий, прив’язаний challenge із явною взаємодією й security review. Передавати довготривалий токен у start_url заборонено в запропонованій архітектурі.

## 6. Push як наскрізна функція

Складові: клієнтський permission + Push API subscription + серверний registry + доставка + notification click routing. Expo native notification token не замінює Web Push subscription; реалізацію web-пайплайну перевірити окремо.

Registry пов’язує endpoint з акаунтом і конкретною інсталяцією/контекстом. Після login switch, logout, unsubscribe або видалення акаунту зв’язок видаляється/відкликається. Прострочені endpoints очищаються за результатами доставки. Permission `granted` без чинної server subscription не показується як «усе працює».

Події: нове повідомлення, ігровий match, відновлення енергії за окремим вибором. Вони мають expiry, deduplication і перевірку актуальності перед доставкою. Quiet hours/opt-out беруться із серверних preferences. Без sensitive text у payload за замовчуванням; push providers можуть обробляти метадані доставки, це враховується в Privacy.

Після tap сервер перевіряє права на цільовий chat/message. Не робити auto-read усіх чатів лише від notification arrival. Badge — необов’язкове прогресивне покращення; відсутність API не ламає unread у застосунку. Push не є гарантією доставки в певну секунду.

## 7. Мобільні медіа, viewport і продуктивність

Використовувати browser capability detection для record/playback/codec, доступу до камери й вибору файлів. Медіа-API перевіряти на реальних iPhone/Android, включаючи permission denied, дзвінок і повернення з background. Нативні Expo API не вважати автоматично рівнозначними web-поведінці.

Клавіатура, browser chrome, safe-area та scroll мають перевірятися разом; composer не покладається лише на фіксовану висоту viewport. Portrait/landscape та великий текст — без обрізання основної дії.

Зображення відповідного розміру, зарезервоване aspect ratio, lazy loading поза першим екраном, обмежений prefetch. Віртуалізація довгої історії зберігає scroll anchor. Не програвати audio/video у background для утримання сесії.

Ціль польових показників на 75-му перцентилі: **LCP ≤2.5 s, INP ≤200 ms, CLS ≤0.1**. Це орієнтири якості, не результати вимірювання цього проєкту. [web.dev — Web Vitals](https://web.dev/articles/vitals).

## 8. Матриця приймання

| Перевірка | Очікувано |
|---|---|
| Close/reopen браузера та PWA | Чинна сесія відновлена; серверні дані ті самі |
| Повернення через 1/7/30 днів у межах затвердженого TTL | Немає безпідставного logout; коректна reauth за строком |
| Browser → install → standalone | Той самий акаунт автоматично або через короткий reauth |
| Очищення browser data | Потрібен новий вхід; покупки/чати не зникають із backend |
| Offline під час refresh | Не видаляється cookie/auth state, retry після reconnect |
| Дві вкладки одночасно витрачають останню енергію | Одна дозволена операція, інша отримує актуальний дефіцит |
| Затримка webhook після checkout | Pending, одне нарахування, відновлений маршрут |
| iOS push без install | Чесний install-flow замість неробочої permission-кнопки |
| Permission denied / unsupported | Нормальне використання без push, доступна інструкція |
| Logout / account switch / delete | Старі push не розкривають дані; відкликані сеанси не працюють |
| Мікрофон denied / background interruption | Немає втрати оплати, зрозумілий fallback |
| Оновлення PWA посеред recording/payment | Немає forced reload; процес завершується керовано |
| Прямий URL чату без входу | Auth gate, після входу перевірка прав і правильний return |
| Великий текст + клавіатура на 320 px | Send, back, ціна й основний контент доступні |

Мінімальна device-матриця: поточний iOS Safari + standalone, попередня підтримувана iOS-версія, актуальний Android Chrome + installed PWA, додатковий поширений Android-браузер, in-app browser, private mode. Номер актуальної версії й підтримуваний мінімум зафіксувати перед реалізацією; «працює в desktop emulator» недостатньо.
