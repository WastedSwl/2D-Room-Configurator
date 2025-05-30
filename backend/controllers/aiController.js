// backend/controllers/aiController.js
const axios = require('axios');

exports.generateModuleConfig = async (req, res) => {
    const { userQuery } = req.body;

    if (!userQuery) {
        return res.status(400).json({ message: "Параметр 'userQuery' обязателен." });
    }

    const openRouterApiKey = process.env.OPENROUTER_API_KEY;
    if (!openRouterApiKey) {
        console.error("OpenRouter API Key не настроен в .env");
        return res.status(500).json({ message: "Ошибка конфигурации сервера: API ключ не найден." });
    }

    // ИЗМЕНЕНИЕ: Обновляем имя модели
    const modelName = "google/gemini-flash-1.5"; // Или "google/gemini-1.5-flash-latest"
                                              // Проверьте актуальное имя на OpenRouter!

    // Промпт можно немного упростить или уточнить для Gemini,
    // особенно инструкции по JSON, если возникнут проблемы.
    // Пока оставим текущий промпт, так как он довольно детальный.
    const prompt = `
Ты — ИИ-ассистент для проектирования модульных зданий. Твоя задача — сгенерировать конфигурацию одного или нескольких модулей на основе запроса пользователя.

# Описание сетки и элементов:
- Стандартный размер одной ячейки сетки: 1.2м x 1.2м.
- Стандартный модуль имеет размеры 2 ячейки в ширину (2.4м) и 5 ячеек в длину (6м). Называется "2x5".
- Модули могут быть объединены. Например, "объединенный модуль 2x5" означает два стандартных модуля 2x5, расположенных рядом и соединенных по длинной стороне без внутренней стены между ними. Эффективный размер такого объединенного модуля будет 4 ячейки в ширину (4.8м) и 5 ячеек в длину (6м) или 2 ячейки в ширину (2.4м) и 10 ячеек в длину (12м) в зависимости от ориентации объединения. Уточняй у пользователя или предлагай вариант, если неясно.
- Координаты модулей (posX, posY) указываются в метрах от начала координат (0,0), привязываясь к сетке (шаг 1.2м).
- Внутренние стены модуля также располагаются по линиям сетки.

# Доступные типы элементов для стен и их стандартные размеры (в метрах):
- "door": { "width": 0.9, "height": 2.1 }
- "window": { "width": 1.2, "height": 1.0 }
- "panoramic_window": { "width": 2.16, "height": 1.8 }
- "outlet": { "width": 0.08, "height": 0.08 }
- "light_wall": { "width": 0.15, "height": 0.3 }
- "radiator": { "width": 0.8, "height": 0.5 }

# Формат ответа:
Ты ДОЛЖЕН вернуть ответ ТОЛЬКО в виде JSON объекта. Никакого другого текста до или после JSON.
JSON должен иметь следующую структуру:
{
  "modules": [
    {
      "label": "Название модуля (например, Спальня)",
      "cellsWide": 2,
      "cellsLong": 5,
      "posX": 0,
      "posY": 0,
      "rotation": 0,
      "mirroredX": false,
      "internalWallSegments": {
        "1,0_v": { "thickness": 0.15 },
        "0,2_h": { "thickness": 0.15 }
      },
      "predefinedElements": [
        {
          "type": "door",
          "segmentKey": "0,0_h",
          "properties": {
            "positionOnSegment": 0.5,
            "openingDirection": "inward",
            "hingeSide": "left"
          }
        }
      ]
    }
  ],
  "notes": "Комментарии для пользователя."
}
# Правила:
1. Если пользователь просит "объединенный модуль" или "двойной модуль", создай ДВА отдельных стандартных модуля 2x5, расположенных рядом. У модулей, которые должны быть объединены, не должно быть стены на стыке.
2. Если запрос неопределенный, предложи конфигурацию из 1-2 стандартных модулей.
3. Размещай элементы логично.
4. Первый модуль в (0,0), если не указано иное. Следующие рядом.
5. Все координаты и ширины элементов, где это применимо (например, окна), должны быть кратны 1.2м.

# Запрос пользователя:
${userQuery}

JSON ответ:
`;
    try {
        console.log(`Отправка запроса к OpenRouter с моделью: ${modelName}`);
        const response = await axios.post(
            "https://openrouter.ai/api/v1/chat/completions",
            {
                model: modelName,
                messages: [
                    { role: "user", content: prompt }
                ],
                // Для Gemini можно явно указать response_format, если поддерживается моделью
                // response_format: { "type": "json_object" }, // Это может помочь, но проверьте документацию модели на OpenRouter
                // temperature: 0.5, // Для более предсказуемого JSON можно понизить температуру
            },
            {
                headers: {
                    "Authorization": `Bearer ${openRouterApiKey}`,
                    "Content-Type": "application/json",
                    "HTTP-Referer": process.env.YOUR_SITE_URL || "http://localhost:3000", // Замените на ваш сайт или оставьте localhost для разработки
                    "X-Title": process.env.YOUR_APP_NAME || "GridSpaceConfigurator",    // Замените на имя вашего приложения
                },
                timeout: 60000 // Увеличим таймаут на всякий случай для LLM
            }
        );

        let aiResponseContent = response.data.choices[0].message.content;
        console.log("Raw AI Response Content:", aiResponseContent);

        const jsonMatch = aiResponseContent.match(/```json\s*([\s\S]*?)\s*```|({[\s\S]*})/);
        let jsonData;

        if (jsonMatch) {
            const jsonString = jsonMatch[1] || jsonMatch[2];
            console.log("Extracted JSON String:", jsonString);
            try {
                jsonData = JSON.parse(jsonString);
            } catch (parseError) {
                console.error("Ошибка парсинга JSON из ответа LLM:", parseError);
                console.error("Строка, которую не удалось распарсить:", jsonString);
                return res.status(500).json({ message: "Ошибка обработки ответа от ИИ: невалидный JSON.", rawResponse: aiResponseContent });
            }
        } else {
            console.warn("Не удалось найти JSON-блок в ответе LLM. Попытка распарсить весь ответ.");
            try {
                jsonData = JSON.parse(aiResponseContent);
            } catch (e) {
                 console.error("Полный ответ также не является валидным JSON:", e);
                 return res.status(500).json({ message: "Ошибка обработки ответа от ИИ: JSON не найден и ответ не является JSON.", rawResponse: aiResponseContent });
            }
        }
        res.status(200).json(jsonData);

    } catch (error) {
        console.error("===== ОШИБКА ЗАПРОСА К OPENROUTER =====");
        if (error.response) {
            console.error("Status:", error.response.status);
            console.error("Headers:", JSON.stringify(error.response.headers, null, 2));
            console.error("Data:", JSON.stringify(error.response.data, null, 2));
        } else if (error.request) {
            console.error("Request Error: No response received. Request data:", error.config ? error.config.data : 'N/A');
        } else {
            console.error("Error Message:", error.message);
        }
        if (error.config) console.error("Config:", JSON.stringify(error.config, null, 2));
        console.error("======================================");

        const message = error.response?.data?.error?.message ||
                       error.response?.data?.message ||
                       "Ошибка при взаимодействии с ИИ-сервисом.";
        const details = error.response?.data || { message: error.message };

        res.status(error.response?.status || 500).json({
            message: message,
            errorDetails: details
        });
    }
};