// Определения модулей
const modules = {
    'ai-assistant': {
        name: 'ИИ Ассистент',
        icon: '🤖',
        desc: 'Умный чат-бот для поддержки клиентов',
        class: 'ai-assistant',
        preview: createAIPreview,
        steps: [
            {
                title: 'Создать файл сервиса ИИ',
                desc: 'Создать новый сервис для API запросов к ИИ',
                code: 'touch html/js/services/ai-service.js'
            },
            {
                title: 'Добавить UI компонент чата',
                desc: 'Создать HTML/CSS виджет чата',
                code: 'Добавить контейнер чата в index.html'
            },
            {
                title: 'Подключить к API',
                desc: 'Настроить API endpoint для ответов ИИ',
                code: 'const response = await fetch("/api/chat")'
            },
            {
                title: 'Обработка сообщений',
                desc: 'Реализовать логику отправки/получения сообщений',
                code: 'socket.on("message", handleMessage)'
            },
            {
                title: 'Стилизация виджета',
                desc: 'Добавить плавающую кнопку чата и анимации',
                code: 'Добавить стили .chat-widget в CSS'
            }
        ]
    },
    'crm': {
        name: 'CRM Панель',
        icon: '📊',
        desc: 'Управление взаимоотношениями с клиентами',
        class: 'crm',
        preview: createCRMPreview,
        steps: [
            {
                title: 'Спроектировать схему БД',
                desc: 'Создать таблицы для клиентов, лидов, сделок',
                code: 'CREATE TABLE customers (...)'
            },
            {
                title: 'Создать API endpoints',
                desc: 'RESTful API для CRUD операций',
                code: 'GET/POST/PUT/DELETE /api/customers'
            },
            {
                title: 'Построить UI панели',
                desc: 'Создать дашборд с графиками и метриками',
                code: 'npm install chart.js'
            },
            {
                title: 'Добавить фильтры и поиск',
                desc: 'Реализовать функционал поиска и фильтрации',
                code: 'const filtered = data.filter(...)'
            }
        ]
    },
    'analytics': {
        name: 'Аналитика',
        icon: '📈',
        desc: 'Отслеживание и визуализация поведения пользователей',
        class: 'analytics',
        preview: createAnalyticsPreview,
        steps: [
            {
                title: 'Добавить скрипт отслеживания',
                desc: 'Вставить код аналитики',
                code: '<script src="analytics.js"></script>'
            },
            {
                title: 'Определить события',
                desc: 'Создать отслеживание пользовательских событий',
                code: 'trackEvent("button_click", {...})'
            },
            {
                title: 'Создать страницу отчётов',
                desc: 'Создать дашборд аналитики',
                code: 'html/analytics-dashboard.html'
            },
            {
                title: 'Настроить пайплайн данных',
                desc: 'Хранение и обработка данных аналитики',
                code: 'INSERT INTO events (...)'
            }
        ]
    },
    'notifications': {
        name: 'Уведомления',
        icon: '🔔',
        desc: 'Push и внутренние уведомления',
        class: 'notifications',
        preview: createNotificationsPreview,
        steps: [
            {
                title: 'Настроить сервис уведомлений',
                desc: 'Создать обработчик уведомлений',
                code: 'class NotificationService {...}'
            },
            {
                title: 'Добавить UI компоненты',
                desc: 'Создать колокольчик и выпадающий список',
                code: '<div class="notification-bell">...'
            },
            {
                title: 'Реализовать WebSocket',
                desc: 'Доставка уведомлений в реальном времени',
                code: 'const ws = new WebSocket(...)'
            },
            {
                title: 'Добавить push-уведомления',
                desc: 'Поддержка браузерных push-уведомлений',
                code: 'Notification.requestPermission()'
            }
        ]
    },
    'payments': {
        name: 'Платежи',
        icon: '💳',
        desc: 'Интеграция обработки платежей',
        class: 'payments',
        preview: createPaymentsPreview,
        steps: [
            {
                title: 'Выбрать платёжного провайдера',
                desc: 'Интегрировать Stripe/PayPal/ЮKassa',
                code: 'npm install stripe'
            },
            {
                title: 'Создать процесс оплаты',
                desc: 'Построить форму оплаты и процесс',
                code: 'stripe.createPaymentMethod(...)'
            },
            {
                title: 'Обработать webhooks',
                desc: 'Обработка событий платежей',
                code: 'POST /webhook/stripe'
            },
            {
                title: 'Добавить историю заказов',
                desc: 'Отслеживание и отображение транзакций',
                code: 'SELECT * FROM transactions'
            }
        ]
    },
    'auth': {
        name: 'Авторизация',
        icon: '🔐',
        desc: 'Вход и регистрация пользователей',
        class: 'auth',
        preview: createAuthPreview,
        steps: [
            {
                title: 'Спроектировать систему авторизации',
                desc: 'Выбрать JWT/Session/OAuth',
                code: 'npm install jsonwebtoken'
            },
            {
                title: 'Создать формы входа/регистрации',
                desc: 'Построить UI авторизации',
                code: '<form id="login-form">...'
            },
            {
                title: 'Реализовать API endpoints',
                desc: 'POST /api/login, /api/register',
                code: 'router.post("/login", ...)'
            },
            {
                title: 'Добавить middleware',
                desc: 'Защита маршрутов проверкой авторизации',
                code: 'app.use(authMiddleware)'
            }
        ]
    }
};

// Текущее состояние
let droppedModules = [];

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    renderModuleList();
    setupDragAndDrop();
    updateImplementationPanel();
});

// Отрисовка списка модулей в сайдбаре
function renderModuleList() {
    const list = document.getElementById('module-list');
    if (!list) return;

    list.innerHTML = Object.entries(modules).map(([key, mod]) => `
        <div class="module-item" draggable="true" data-module="${key}">
            <span class="icon">${mod.icon}</span>
            <span class="name">${mod.name}</span>
            <div class="desc">${mod.desc}</div>
        </div>
    `).join('');
}

// Настройка drag and drop
function setupDragAndDrop() {
    const moduleItems = document.querySelectorAll('.module-item');
    const canvas = document.getElementById('canvas');

    moduleItems.forEach(item => {
        item.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('module', e.target.dataset.module);
            e.target.classList.add('dragging');
        });

        item.addEventListener('dragend', (e) => {
            e.target.classList.remove('dragging');
        });
    });

    if (canvas) {
        canvas.addEventListener('dragover', (e) => {
            e.preventDefault();
            canvas.classList.add('drag-over');
        });

        canvas.addEventListener('dragleave', () => {
            canvas.classList.remove('drag-over');
        });

        canvas.addEventListener('drop', (e) => {
            e.preventDefault();
            canvas.classList.remove('drag-over');
            const moduleKey = e.dataTransfer.getData('module');
            if (moduleKey && modules[moduleKey]) {
                addModuleToCanvas(moduleKey);
            }
        });
    }
}

// Добавить модуль на холст
function addModuleToCanvas(moduleKey) {
    if (droppedModules.includes(moduleKey)) {
        return; // Уже добавлен
    }

    droppedModules.push(moduleKey);
    renderCanvas();
    updateImplementationPanel();
}

// Удалить модуль с холста
function removeModule(moduleKey) {
    droppedModules = droppedModules.filter(m => m !== moduleKey);
    renderCanvas();
    updateImplementationPanel();
}

// Отрисовка холста
function renderCanvas() {
    const canvas = document.getElementById('canvas');
    const placeholder = document.getElementById('canvas-placeholder');

    if (droppedModules.length === 0) {
        placeholder.style.display = 'block';
        // Удалить добавленные модули
        canvas.querySelectorAll('.dropped-module').forEach(el => el.remove());
        return;
    }

    placeholder.style.display = 'none';

    // Очистить и перерисовать
    canvas.querySelectorAll('.dropped-module').forEach(el => el.remove());

    droppedModules.forEach(moduleKey => {
        const mod = modules[moduleKey];
        const moduleEl = document.createElement('div');
        moduleEl.className = `dropped-module ${mod.class}`;
        moduleEl.innerHTML = `
            <div class="module-header">
                <div class="module-title">
                    <span>${mod.icon}</span>
                    ${mod.name}
                </div>
                <button class="remove-btn" onclick="removeModule('${moduleKey}')">&times;</button>
            </div>
            <div class="module-preview" id="preview-${moduleKey}"></div>
        `;
        canvas.appendChild(moduleEl);

        // Отрисовать превью
        const previewContainer = document.getElementById(`preview-${moduleKey}`);
        if (mod.preview) {
            mod.preview(previewContainer);
        }
    });
}

// Обновить панель реализации
function updateImplementationPanel() {
    const panel = document.getElementById('steps-list');
    if (!panel) return;

    if (droppedModules.length === 0) {
        panel.innerHTML = `
            <div class="empty-steps">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                </svg>
                <p>Перетащите модули на холст, чтобы увидеть шаги реализации</p>
            </div>
        `;
        return;
    }

    let html = '';
    let stepNum = 1;

    droppedModules.forEach(moduleKey => {
        const mod = modules[moduleKey];
        html += `<h4 style="margin: 1rem 0 0.5rem; color: var(--text-secondary);">${mod.icon} ${mod.name}</h4>`;

        mod.steps.forEach(step => {
            html += `
                <div class="step-item">
                    <div class="step-number">Шаг ${stepNum}</div>
                    <div class="step-title">${step.title}</div>
                    <div class="step-desc">${step.desc}</div>
                    <code>${step.code}</code>
                </div>
            `;
            stepNum++;
        });
    });

    panel.innerHTML = html;
}

// Генераторы превью
function createAIPreview(container) {
    container.innerHTML = `
        <div class="ai-chat-preview">
            <div class="chat-message user">Как я могу оформить заказ?</div>
            <div class="chat-message assistant">Я могу помочь вам с этим! Вы можете оформить заказ, нажав кнопку "Заказать" на странице любого товара. Хотите, я проведу вас через этот процесс?</div>
            <div class="chat-input-preview">
                <input type="text" placeholder="Введите сообщение..." disabled>
                <button disabled>Отправить</button>
            </div>
        </div>
    `;
}

function createCRMPreview(container) {
    container.innerHTML = `
        <div class="crm-preview">
            <div class="crm-card">
                <div class="number">1 234</div>
                <div class="label">Всего клиентов</div>
            </div>
            <div class="crm-card">
                <div class="number">89</div>
                <div class="label">Активных лидов</div>
            </div>
            <div class="crm-card">
                <div class="number">2.5М</div>
                <div class="label">Выручка</div>
            </div>
        </div>
    `;
}

function createAnalyticsPreview(container) {
    container.innerHTML = `
        <div class="analytics-preview">
            <div class="chart-bar">
                <span class="label">Посетители</span>
                <div class="bar"><div class="fill" style="width: 85%"></div></div>
            </div>
            <div class="chart-bar">
                <span class="label">Регистрации</span>
                <div class="bar"><div class="fill" style="width: 62%"></div></div>
            </div>
            <div class="chart-bar">
                <span class="label">Заказы</span>
                <div class="bar"><div class="fill" style="width: 45%"></div></div>
            </div>
            <div class="chart-bar">
                <span class="label">Выручка</span>
                <div class="bar"><div class="fill" style="width: 73%"></div></div>
            </div>
        </div>
    `;
}

function createNotificationsPreview(container) {
    container.innerHTML = `
        <div class="notifications-preview">
            <div class="notification-item success">
                <span class="icon">✅</span>
                <span class="text">Новый заказ получен от Клиента #1234</span>
            </div>
            <div class="notification-item warning">
                <span class="icon">⚠️</span>
                <span class="text">Мало товара на складе: Артикул-456</span>
            </div>
            <div class="notification-item">
                <span class="icon">📧</span>
                <span class="text">Новое сообщение от службы поддержки</span>
            </div>
        </div>
    `;
}

function createPaymentsPreview(container) {
    container.innerHTML = `
        <div style="text-align: center; padding: 1rem;">
            <div style="font-size: 2rem; margin-bottom: 0.5rem;">💳</div>
            <div style="background: var(--bg-dark); padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
                <input type="text" placeholder="4242 4242 4242 4242" style="background: transparent; border: none; color: var(--text-primary); width: 100%; text-align: center; font-size: 1.1rem;" disabled>
            </div>
            <button class="btn btn-primary" disabled>Оплатить 9 900 руб.</button>
        </div>
    `;
}

function createAuthPreview(container) {
    container.innerHTML = `
        <div style="max-width: 250px; margin: 0 auto;">
            <div style="margin-bottom: 0.75rem;">
                <input type="email" placeholder="Email" style="width: 100%; padding: 0.5rem; background: var(--bg-dark); border: 1px solid var(--border); border-radius: 4px; color: var(--text-primary);" disabled>
            </div>
            <div style="margin-bottom: 0.75rem;">
                <input type="password" placeholder="Пароль" style="width: 100%; padding: 0.5rem; background: var(--bg-dark); border: 1px solid var(--border); border-radius: 4px; color: var(--text-primary);" disabled>
            </div>
            <button class="btn btn-primary" style="width: 100%;" disabled>Войти</button>
        </div>
    `;
}

// Очистить холст
function clearCanvas() {
    droppedModules = [];
    renderCanvas();
    updateImplementationPanel();
}

// Экспорт плана
function exportPlan() {
    if (droppedModules.length === 0) {
        alert('Сначала добавьте модули на холст!');
        return;
    }

    let plan = '# План реализации для biznes.lucheestiy.com\n\n';
    plan += `Создан: ${new Date().toLocaleDateString('ru-RU')}\n\n`;
    plan += '## Выбранные модули\n\n';

    droppedModules.forEach(moduleKey => {
        const mod = modules[moduleKey];
        plan += `### ${mod.icon} ${mod.name}\n`;
        plan += `${mod.desc}\n\n`;
        plan += '**Шаги:**\n';
        mod.steps.forEach((step, i) => {
            plan += `${i + 1}. **${step.title}** - ${step.desc}\n`;
            plan += `   \`${step.code}\`\n`;
        });
        plan += '\n';
    });

    // Скачать как файл
    const blob = new Blob([plan], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'plan-realizacii.md';
    a.click();
    URL.revokeObjectURL(url);
}
