import { useState, useEffect, useRef, useMemo } from "react";
import { supabase } from "./supabase";

// ── ЗВУКИ (Web Audio API) ─────────────────────────────────────
function playSound(type) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (type === "correct") {
      [523, 659, 784].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        osc.frequency.value = freq; osc.type = "sine";
        gain.gain.setValueAtTime(0.25, ctx.currentTime + i * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.1 + 0.25);
        osc.start(ctx.currentTime + i * 0.1);
        osc.stop(ctx.currentTime + i * 0.1 + 0.25);
      });
    } else {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.frequency.value = 180; osc.type = "sawtooth";
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.35);
    }
  } catch {}
}

// ── КОНФЕТТИ ─────────────────────────────────────────────────
function Confetti() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    const pieces = Array.from({ length: 80 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * -canvas.height,
      w: 8 + Math.random() * 8,
      h: 5 + Math.random() * 5,
      color: ["#7C5CFC","#10b981","#f59e0b","#ef4444","#3b82f6","#ec4899"][Math.floor(Math.random()*6)],
      speed: 2 + Math.random() * 4,
      angle: Math.random() * Math.PI * 2,
      spin: (Math.random() - 0.5) * 0.2,
    }));
    let frame;
    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      pieces.forEach(p => {
        p.y += p.speed; p.angle += p.spin;
        if (p.y > canvas.height) p.y = -20;
        ctx.save(); ctx.translate(p.x + p.w/2, p.y + p.h/2);
        ctx.rotate(p.angle); ctx.fillStyle = p.color;
        ctx.fillRect(-p.w/2, -p.h/2, p.w, p.h);
        ctx.restore();
      });
      frame = requestAnimationFrame(draw);
    }
    draw();
    const t = setTimeout(() => cancelAnimationFrame(frame), 3500);
    return () => { cancelAnimationFrame(frame); clearTimeout(t); };
  }, []);
  return <canvas ref={canvasRef} style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 99 }} />;
}

// ── ВОПРОСЫ ПО УРОВНЯМ ───────────────────────────────────────

const ALL_QUESTIONS = [
  // A0 — Числа и цвета
  { id: 1, level: "A0", type: "translate", category: "Основы", prompt: "Как переводится слово?", word: "eins", options: ["Два", "Три", "Один", "Четыре"], correct: 2, hint: "Первое число" },
  { id: 2, level: "A0", type: "translate", category: "Основы", prompt: "Как переводится слово?", word: "zwei", options: ["Один", "Два", "Три", "Пять"], correct: 1, hint: "1 + 1 = ?" },
  { id: 3, level: "A0", type: "translate", category: "Основы", prompt: "Как переводится слово?", word: "rot", options: ["Синий", "Зелёный", "Красный", "Жёлтый"], correct: 2, hint: "Цвет крови" },
  { id: 4, level: "A0", type: "translate", category: "Основы", prompt: "Как переводится слово?", word: "blau", options: ["Красный", "Синий", "Белый", "Чёрный"], correct: 1, hint: "Цвет неба" },
  { id: 5, level: "A0", type: "translate", category: "Основы", prompt: "Как переводится слово?", word: "Hallo", options: ["Пока", "Спасибо", "Привет", "Пожалуйста"], correct: 2, hint: "Приветствие" },
  { id: 6, level: "A0", type: "translate", category: "Основы", prompt: "Как переводится слово?", word: "Danke", options: ["Привет", "Пожалуйста", "Спасибо", "Пока"], correct: 2, hint: "Говорят в ответ на помощь" },
  { id: 7, level: "A0", type: "translate", category: "Основы", prompt: "Как переводится слово?", word: "ja", options: ["Нет", "Может быть", "Да", "Никогда"], correct: 2, hint: "Противоположность «нет»" },
  { id: 8, level: "A0", type: "translate", category: "Основы", prompt: "Как переводится слово?", word: "nein", options: ["Да", "Нет", "Может", "Всегда"], correct: 1, hint: "Противоположность «да»" },
  { id: 9, level: "A0", type: "translate", category: "Основы", prompt: "Как переводится слово?", word: "groß", options: ["Маленький", "Быстрый", "Большой", "Тихий"], correct: 2, hint: "Антоним «klein»" },
  { id: 10, level: "A0", type: "translate", category: "Основы", prompt: "Как переводится слово?", word: "klein", options: ["Большой", "Маленький", "Старый", "Новый"], correct: 1, hint: "Антоним «groß»" },
  { id: 11, level: "A0", type: "translate", category: "Основы", prompt: "Как переводится слово?", word: "Wasser", options: ["Хлеб", "Молоко", "Вода", "Сок"], correct: 2, hint: "H₂O" },
  { id: 12, level: "A0", type: "translate", category: "Основы", prompt: "Как переводится слово?", word: "Haus", options: ["Машина", "Дом", "Дерево", "Дорога"], correct: 1, hint: "Где живут люди" },
  { id: 13, level: "A0", type: "translate", category: "Основы", prompt: "Как переводится слово?", word: "Hund", options: ["Кошка", "Птица", "Собака", "Рыба"], correct: 2, hint: "Лучший друг человека" },
  { id: 14, level: "A0", type: "translate", category: "Основы", prompt: "Как переводится слово?", word: "Katze", options: ["Собака", "Кошка", "Мышь", "Лошадь"], correct: 1, hint: "Мяукает" },
  { id: 15, level: "A0", type: "translate", category: "Основы", prompt: "Как переводится слово?", word: "gut", options: ["Плохой", "Хороший", "Быстрый", "Старый"], correct: 1, hint: "Антоним «schlecht»" },
  { id: 16, level: "A0", type: "translate", category: "Основы", prompt: "Как переводится слово?", word: "Mutter", options: ["Отец", "Сестра", "Мать", "Бабушка"], correct: 2, hint: "Женщина, которая тебя родила" },
  { id: 17, level: "A0", type: "translate", category: "Основы", prompt: "Как переводится слово?", word: "Vater", options: ["Мать", "Отец", "Брат", "Дедушка"], correct: 1, hint: "Папа" },
  { id: 18, level: "A0", type: "translate", category: "Основы", prompt: "Как переводится слово?", word: "essen", options: ["Пить", "Спать", "Есть", "Идти"], correct: 2, hint: "Что делают за столом" },
  { id: 19, level: "A0", type: "translate", category: "Основы", prompt: "Как переводится слово?", word: "trinken", options: ["Есть", "Пить", "Читать", "Писать"], correct: 1, hint: "Что делают со стаканом воды" },
  { id: 20, level: "A0", type: "translate", category: "Основы", prompt: "Как переводится слово?", word: "schlafen", options: ["Работать", "Играть", "Спать", "Бежать"], correct: 2, hint: "Что делают ночью" },

  // A1 — Природа, Еда, Город
  { id: 21, level: "A1", type: "translate", category: "Природа", prompt: "Как переводится слово?", word: "die Brücke", options: ["Мост", "Река", "Дорога", "Берег"], correct: 0, hint: "По ней переходят через реку" },
  { id: 22, level: "A1", type: "translate", category: "Природа", prompt: "Как переводится слово?", word: "die Wolke", options: ["Вода", "Облако", "Ветер", "Земля"], correct: 1, hint: "Бывает на небе" },
  { id: 23, level: "A1", type: "translate", category: "Природа", prompt: "Как переводится слово?", word: "der Schmetterling", options: ["Жук", "Бабочка", "Стрекоза", "Пчела"], correct: 1, hint: "Летает среди цветов" },
  { id: 24, level: "A1", type: "translate", category: "Природа", prompt: "Как переводится слово?", word: "der Wald", options: ["Поле", "Лес", "Гора", "Озеро"], correct: 1, hint: "Много деревьев" },
  { id: 25, level: "A1", type: "translate", category: "Природа", prompt: "Как переводится слово?", word: "der Regen", options: ["Снег", "Туман", "Дождь", "Ветер"], correct: 2, hint: "Капает с неба" },
  { id: 26, level: "A1", type: "translate", category: "Природа", prompt: "Как переводится слово?", word: "die Blume", options: ["Дерево", "Трава", "Куст", "Цветок"], correct: 3, hint: "Растёт в саду, пахнет красиво" },
  { id: 27, level: "A1", type: "translate", category: "Природа", prompt: "Как переводится слово?", word: "der Schnee", options: ["Лёд", "Снег", "Град", "Иней"], correct: 1, hint: "Белый и холодный" },
  { id: 28, level: "A1", type: "translate", category: "Природа", prompt: "Как переводится слово?", word: "der Fluss", options: ["Море", "Река", "Озеро", "Ручей"], correct: 1, hint: "Течёт между берегами" },
  { id: 29, level: "A1", type: "translate", category: "Еда", prompt: "Как переводится слово?", word: "der Kuchen", options: ["Хлеб", "Пирог", "Суп", "Сыр"], correct: 1, hint: "Сладкое, часто к кофе" },
  { id: 30, level: "A1", type: "translate", category: "Еда", prompt: "Как переводится слово?", word: "das Brot", options: ["Булочка", "Пирог", "Хлеб", "Печенье"], correct: 2, hint: "Основа немецкого стола" },
  { id: 31, level: "A1", type: "translate", category: "Еда", prompt: "Как переводится слово?", word: "die Kartoffel", options: ["Морковь", "Лук", "Картофель", "Капуста"], correct: 2, hint: "Из неё делают картошку-фри" },
  { id: 32, level: "A1", type: "translate", category: "Еда", prompt: "Как переводится слово?", word: "der Käse", options: ["Масло", "Молоко", "Творог", "Сыр"], correct: 3, hint: "Делают из молока, бывает с дырками" },
  { id: 33, level: "A1", type: "translate", category: "Еда", prompt: "Как переводится слово?", word: "das Ei", options: ["Молоко", "Яйцо", "Мясо", "Рыба"], correct: 1, hint: "Кладут в омлет" },
  { id: 34, level: "A1", type: "translate", category: "Еда", prompt: "Как переводится слово?", word: "der Apfel", options: ["Груша", "Слива", "Яблоко", "Вишня"], correct: 2, hint: "Красный или зелёный фрукт" },
  { id: 35, level: "A1", type: "translate", category: "Город", prompt: "Как переводится слово?", word: "der Bahnhof", options: ["Аэропорт", "Вокзал", "Порт", "Стоянка"], correct: 1, hint: "Bahn — поезд, Hof — двор" },
  { id: 36, level: "A1", type: "translate", category: "Город", prompt: "Как переводится слово?", word: "die Straße", options: ["Площадь", "Переулок", "Улица", "Проспект"], correct: 2, hint: "По ней едут машины" },
  { id: 37, level: "A1", type: "translate", category: "Город", prompt: "Как переводится слово?", word: "das Krankenhaus", options: ["Школа", "Больница", "Аптека", "Банк"], correct: 1, hint: "Krank — больной, Haus — дом" },
  { id: 38, level: "A1", type: "translate", category: "Город", prompt: "Как переводится слово?", word: "die Bibliothek", options: ["Музей", "Театр", "Библиотека", "Галерея"], correct: 2, hint: "Там берут книги" },
  { id: 39, level: "A1", type: "translate", category: "Дом", prompt: "Как переводится слово?", word: "der Kühlschrank", options: ["Плита", "Холодильник", "Шкаф", "Раковина"], correct: 1, hint: "kühl — прохладный" },
  { id: 40, level: "A1", type: "translate", category: "Дом", prompt: "Как переводится слово?", word: "das Fenster", options: ["Дверь", "Стена", "Окно", "Потолок"], correct: 2, hint: "Через него светит солнце" },
  { id: 41, level: "A1", type: "translate", category: "Дом", prompt: "Как переводится слово?", word: "der Stuhl", options: ["Стол", "Кровать", "Диван", "Стул"], correct: 3, hint: "На нём сидят" },
  { id: 42, level: "A1", type: "translate", category: "Дом", prompt: "Как переводится слово?", word: "die Treppe", options: ["Лифт", "Лестница", "Коридор", "Балкон"], correct: 1, hint: "По ней поднимаются на этаж" },
  { id: 43, level: "A1", type: "translate", category: "Чувства", prompt: "Как переводится слово?", word: "die Freude", options: ["Грусть", "Страх", "Радость", "Злость"], correct: 2, hint: "Когда всё хорошо" },
  { id: 44, level: "A1", type: "translate", category: "Чувства", prompt: "Как переводится слово?", word: "die Angst", options: ["Боль", "Страх", "Усталость", "Скука"], correct: 1, hint: "Неприятное чувство перед опасностью" },

  // A1 — Артикли (базовые)
  { id: 45, level: "A1", type: "fill", category: "Грамматика", prompt: "Выбери правильный артикль:", word: "___ Hund bellt laut.", options: ["Der", "Die", "Das", "Dem"], correct: 0, hint: "Hund — мужской род" },
  { id: 46, level: "A1", type: "fill", category: "Грамматика", prompt: "Выбери правильный артикль:", word: "___ Sonne scheint.", options: ["Der", "Die", "Das", "Den"], correct: 1, hint: "Sonne — женский род" },
  { id: 47, level: "A1", type: "fill", category: "Грамматика", prompt: "Выбери правильный артикль:", word: "___ Kind spielt.", options: ["Der", "Die", "Das", "Dem"], correct: 2, hint: "Kind — средний род" },
  { id: 48, level: "A1", type: "fill", category: "Грамматика", prompt: "Выбери правильный артикль:", word: "___ Buch ist interessant.", options: ["Der", "Die", "Das", "Dem"], correct: 2, hint: "Buch — средний род" },
  { id: 49, level: "A1", type: "fill", category: "Грамматика", prompt: "Выбери правильный артикль:", word: "___ Katze schläft.", options: ["Der", "Die", "Das", "Den"], correct: 1, hint: "Katze — женский род" },
  { id: 50, level: "A1", type: "fill", category: "Грамматика", prompt: "Выбери правильный артикль:", word: "___ Wasser ist kalt.", options: ["Der", "Die", "Das", "Den"], correct: 2, hint: "Wasser — средний род" },
  { id: 51, level: "A1", type: "choose", category: "Грамматика", prompt: "Какое предложение грамматически верно?", word: null, options: ["Ich gehe morgen zur Schule.", "Ich gehen morgen zur Schule.", "Ich geht morgen zur Schule.", "Ich gehst morgen zur Schule."], correct: 0, hint: "Ich → первое лицо ед. числа → gehe" },
  { id: 52, level: "A1", type: "choose", category: "Грамматика", prompt: "Какое предложение грамматически верно?", word: null, options: ["Er haben ein Auto.", "Er hat ein Auto.", "Er habe ein Auto.", "Er hast ein Auto."], correct: 1, hint: "er/sie/es → hat" },
  { id: 53, level: "A1", type: "choose", category: "Грамматика", prompt: "Какое предложение грамматически верно?", word: null, options: ["Wir spielen Fußball.", "Wir spielt Fußball.", "Wir spielst Fußball.", "Wir spielen Fußballe."], correct: 0, hint: "wir → spielen (окончание -en)" },

  // A2 — Сложные темы
  { id: 54, level: "A2", type: "translate", category: "Чувства", prompt: "Как переводится слово?", word: "die Sehnsucht", options: ["Радость", "Скука", "Тоска", "Злость"], correct: 2, hint: "Глубокое тоскливое желание" },
  { id: 55, level: "A2", type: "translate", category: "Время", prompt: "Как переводится слово?", word: "das Jahrhundert", options: ["Год", "Десятилетие", "Век", "Момент"], correct: 2, hint: "100 лет" },
  { id: 56, level: "A2", type: "translate", category: "Время", prompt: "Как переводится слово?", word: "die Zukunft", options: ["Прошлое", "Настоящее", "Будущее", "История"], correct: 2, hint: "То, что ещё не случилось" },
  { id: 57, level: "A2", type: "translate", category: "Время", prompt: "Как переводится слово?", word: "gestern", options: ["Сегодня", "Завтра", "Вчера", "Недавно"], correct: 2, hint: "День до сегодняшнего" },
  { id: 58, level: "A2", type: "translate", category: "Город", prompt: "Как переводится слово?", word: "das Rathaus", options: ["Тюрьма", "Ратуша", "Церковь", "Замок"], correct: 1, hint: "Центр городского управления" },
  { id: 59, level: "A2", type: "translate", category: "Дом", prompt: "Как переводится слово?", word: "das Schloss", options: ["Ключ", "Дверь", "Замок", "Окно"], correct: 2, hint: "Может быть и дворцом, и замком на двери" },
  { id: 60, level: "A2", type: "fill", category: "Грамматика", prompt: "Выбери правильный артикль:", word: "Ich sehe ___ Mann.", options: ["der", "die", "das", "den"], correct: 3, hint: "Akkusativ, мужской род → den" },
  { id: 61, level: "A2", type: "fill", category: "Грамматика", prompt: "Выбери правильный артикль:", word: "Sie hilft ___ Frau.", options: ["der", "die", "das", "den"], correct: 0, hint: "Dativ, женский род → der" },
  { id: 62, level: "A2", type: "fill", category: "Грамматика", prompt: "Выбери правильный артикль:", word: "Ich kaufe ___ Apfel.", options: ["der", "die", "den", "das"], correct: 2, hint: "Akkusativ, мужской род → den" },
  { id: 63, level: "A2", type: "fill", category: "Грамматика", prompt: "Выбери правильный артикль:", word: "Er gibt ___ Kind ein Geschenk.", options: ["der", "die", "dem", "das"], correct: 2, hint: "Dativ, средний род → dem" },
  { id: 64, level: "A2", type: "choose", category: "Грамматика", prompt: "Выбери правильный порядок слов:", word: null, options: ["Morgen ich gehe ins Kino.", "Ich morgen gehe ins Kino.", "Morgen gehe ich ins Kino.", "Ins Kino ich gehe morgen."], correct: 2, hint: "Если наречие в начале — глагол на 2-м месте" },
  { id: 65, level: "A2", type: "choose", category: "Грамматика", prompt: "Как правильно сказать в прошедшем времени?", word: null, options: ["Ich habe geschlafen.", "Ich bin geschlafen.", "Ich habe schlafe.", "Ich war schlafe."], correct: 0, hint: "schlafen → Perfekt с haben" },
  { id: 66, level: "A2", type: "choose", category: "Грамматика", prompt: "Какое предложение верно?", word: null, options: ["Ich bin gegangen.", "Ich habe gegangen.", "Ich war gehen.", "Ich bin gehe."], correct: 0, hint: "gehen → Perfekt с sein" },
  { id: 67, level: "A2", type: "choose", category: "Грамматика", prompt: "Выбери правильный вариант:", word: null, options: ["Er kommt aus Deutschland.", "Er kommt von Deutschland.", "Er kommt aus der Deutschland.", "Er kommt von der Deutschland."], correct: 0, hint: "aus + страна без артикля" },
  { id: 68, level: "A2", type: "choose", category: "Грамматика", prompt: "Какое предложение грамматически верно?", word: null, options: ["Ich möchte Kaffee trinken.", "Ich möchte Kaffee trinkst.", "Ich möchte Kaffee trinkt.", "Ich möchten Kaffee trinken."], correct: 0, hint: "Модальный глагол + инфинитив в конце" },
  { id: 69, level: "A2", type: "choose", category: "Грамматика", prompt: "Какое предложение грамматически верно?", word: null, options: ["Du gehst ins Kino?", "Du gehst im Kino?", "Du gehen ins Kino?", "Du geht ins Kino?"], correct: 0, hint: "du → gehst; ins = in das" },

  // A3 — Здоровье, Покупки, Транспорт
  { id: 70, level: "A3", type: "translate", category: "Здоровье", prompt: "Как переводится слово?", word: "der Husten", options: ["Насморк", "Кашель", "Температура", "Боль"], correct: 1, hint: "Кашляют, когда простудились" },
  { id: 71, level: "A3", type: "translate", category: "Здоровье", prompt: "Как переводится слово?", word: "das Fieber", options: ["Кашель", "Насморк", "Боль", "Температура"], correct: 3, hint: "Когда жарко — измеряют градусником" },
  { id: 72, level: "A3", type: "translate", category: "Здоровье", prompt: "Как переводится слово?", word: "die Apotheke", options: ["Больница", "Поликлиника", "Аптека", "Кабинет"], correct: 2, hint: "Там продают лекарства" },
  { id: 73, level: "A3", type: "translate", category: "Здоровье", prompt: "Как переводится слово?", word: "das Rezept", options: ["Лекарство", "Таблетка", "Рецепт", "Анализ"], correct: 2, hint: "Врач выписывает, аптека принимает" },
  { id: 74, level: "A3", type: "translate", category: "Здоровье", prompt: "Как переводится слово?", word: "der Rücken", options: ["Живот", "Плечо", "Шея", "Спина"], correct: 3, hint: "Может заболеть от долгого сидения" },
  { id: 75, level: "A3", type: "translate", category: "Покупки", prompt: "Как переводится слово?", word: "die Bäckerei", options: ["Мясная лавка", "Рынок", "Булочная", "Кондитерская"], correct: 2, hint: "Там продают свежий хлеб" },
  { id: 76, level: "A3", type: "translate", category: "Покупки", prompt: "Как переводится слово?", word: "teuer", options: ["Дешёвый", "Новый", "Дорогой", "Красивый"], correct: 2, hint: "Антоним billig" },
  { id: 77, level: "A3", type: "translate", category: "Покупки", prompt: "Как переводится слово?", word: "bezahlen", options: ["Покупать", "Продавать", "Платить", "Считать"], correct: 2, hint: "Что делают на кассе" },
  { id: 78, level: "A3", type: "translate", category: "Транспорт", prompt: "Как переводится слово?", word: "die Abfahrt", options: ["Прибытие", "Остановка", "Платформа", "Отправление"], correct: 3, hint: "Противоположность Ankunft" },
  { id: 79, level: "A3", type: "translate", category: "Транспорт", prompt: "Как переводится слово?", word: "der Fahrplan", options: ["Билет", "Маршрут", "Расписание", "Платформа"], correct: 2, hint: "Fahren + Plan — план поездок" },
  { id: 80, level: "A3", type: "translate", category: "Транспорт", prompt: "Как переводится слово?", word: "der Bahnsteig", options: ["Вокзал", "Платформа", "Перрон входа", "Расписание"], correct: 1, hint: "Там ждут поезд" },
  { id: 81, level: "A3", type: "choose", category: "Здоровье", prompt: "Как сказать «У меня болит голова»?", word: null, options: ["Ich habe Kopf.", "Mein Kopf tut weh.", "Der Kopf ist krank.", "Ich bin krank Kopf."], correct: 1, hint: "tut weh = болит" },
  { id: 82, level: "A3", type: "choose", category: "Транспорт", prompt: "Как сказать «Идите прямо»?", word: null, options: ["Gehen Sie links.", "Gehen Sie rechts.", "Gehen Sie geradeaus.", "Gehen Sie zurück."], correct: 2, hint: "gerade = прямо, aus = вперёд" },

  // A4 — Работа, Досуг, Общение
  { id: 83, level: "A4", type: "translate", category: "Работа", prompt: "Как переводится слово?", word: "das Gehalt", options: ["Должность", "Офис", "Зарплата", "Договор"], correct: 2, hint: "Получают раз в месяц" },
  { id: 84, level: "A4", type: "translate", category: "Работа", prompt: "Как переводится слово?", word: "die Besprechung", options: ["Перерыв", "Совещание", "Отпуск", "Командировка"], correct: 1, hint: "Все сотрудники собираются вместе" },
  { id: 85, level: "A4", type: "translate", category: "Работа", prompt: "Как переводится слово?", word: "die Überstunden", options: ["Выходные", "Перерыв", "Сверхурочные", "Смена"], correct: 2, hint: "Работа сверх нормы" },
  { id: 86, level: "A4", type: "translate", category: "Досуг", prompt: "Как переводится слово?", word: "die Ausstellung", options: ["Концерт", "Выставка", "Экскурсия", "Спектакль"], correct: 1, hint: "Обычно бывает в музее или галерее" },
  { id: 87, level: "A4", type: "translate", category: "Досуг", prompt: "Как переводится слово?", word: "wandern", options: ["Плавать", "Бегать", "Ехать на велосипеде", "Ходить в походы"], correct: 3, hint: "Популярно в горах и лесах Германии" },
  { id: 88, level: "A4", type: "translate", category: "Общение", prompt: "Как переводится слово?", word: "die Staatsangehörigkeit", options: ["Адрес", "Профессия", "Гражданство", "Дата рождения"], correct: 2, hint: "Указывают в паспорте и анкетах" },
  { id: 89, level: "A4", type: "translate", category: "Общение", prompt: "Как переводится слово?", word: "die Postleitzahl", options: ["Телефон", "Почтовый индекс", "Улица", "Страна"], correct: 1, hint: "PLZ — 5 цифр перед городом в адресе" },
  { id: 90, level: "A4", type: "choose", category: "Работа", prompt: "Как правильно сказать «Я учительница»?", word: null, options: ["Ich bin eine Lehrerin.", "Ich bin die Lehrerin.", "Ich bin Lehrerin.", "Ich habe Lehrerin."], correct: 2, hint: "Профессия — без артикля!" },
  { id: 91, level: "A4", type: "choose", category: "Общение", prompt: "Как попрощаться по телефону?", word: null, options: ["Auf Wiedersehen!", "Guten Abend!", "Auf Wiederhören!", "Tschüss auf Telefon!"], correct: 2, hint: "hören = слышать — особое прощание для телефона" },
  { id: 92, level: "A4", type: "choose", category: "Досуг", prompt: "«Hast du Lust ins Kino zu gehen?» — что это значит?", word: null, options: ["Ты уже был в кино?", "Хочешь пойти в кино?", "Тебе понравилось кино?", "Ты идёшь в кино?"], correct: 1, hint: "Lust haben = хотеть, иметь желание" },
];

// Вопросы для теста на определение уровня
const PLACEMENT_TEST = [
  { id: "p1", prompt: "Что значит «Hallo»?", options: ["Пока", "Привет", "Спасибо", "Да"], correct: 1, hint: null },
  { id: "p2", prompt: "Что значит «zwei»?", options: ["Один", "Три", "Два", "Пять"], correct: 2, hint: null },
  { id: "p3", prompt: "Что значит «groß»?", options: ["Маленький", "Быстрый", "Старый", "Большой"], correct: 3, hint: null },
  { id: "p4", prompt: "Выбери правильный артикль: ___ Hund", options: ["Die", "Das", "Der", "Den"], correct: 2, hint: null },
  { id: "p5", prompt: "Что значит «der Bahnhof»?", options: ["Аэропорт", "Вокзал", "Магазин", "Школа"], correct: 1, hint: null },
  { id: "p6", prompt: "Какое предложение верно?", options: ["Ich gehen zur Schule.", "Ich geht zur Schule.", "Ich gehe zur Schule.", "Ich gehst zur Schule."], correct: 2, hint: null },
  { id: "p7", prompt: "Что значит «die Zukunft»?", options: ["Прошлое", "Настоящее", "Будущее", "Время"], correct: 2, hint: null },
  { id: "p8", prompt: "Выбери правильный артикль: Ich sehe ___ Mann.", options: ["der", "die", "das", "den"], correct: 3, hint: null },
  { id: "p9", prompt: "Как сказать «я ходил» (Perfekt)?", options: ["Ich war gehen.", "Ich habe gegangen.", "Ich bin gegangen.", "Ich gehe gegangen."], correct: 2, hint: null },
  { id: "p10", prompt: "Выбери правильный порядок слов:", options: ["Morgen ich gehe ins Kino.", "Morgen gehe ich ins Kino.", "Ich gehe morgen ins Kino immer.", "Ins Kino morgen ich gehe."], correct: 1, hint: null },
];

const LEVEL_FROM_SCORE = (score) => {
  if (score <= 3) return "A0";
  if (score <= 6) return "A1";
  return "A2";
};

const LEVEL_INFO = {
  A0: { label: "A0 · Начинающий", color: "#10b981", desc: "Базовые слова и фразы" },
  A1: { label: "A1 · Базовый", color: "#7C5CFC", desc: "Простая лексика и артикли" },
  A2: { label: "A1 · Элементарный", color: "#f59e0b", desc: "Грамматика и падежи" },
};

const CATEGORIES_BY_LEVEL = {
  A0: ["Основы"],
  A1: ["Природа", "Еда", "Город", "Дом", "Чувства", "Грамматика"],
  A2: ["Чувства", "Время", "Город", "Дом", "Грамматика"],
};

const CATEGORY_ICONS = { "Основы": "🔤", "Природа": "🌿", "Еда": "🍞", "Город": "🏙️", "Дом": "🏠", "Чувства": "💜", "Грамматика": "📝", "Время": "⏳" };
const PARTNER = { name: "Maria", avatar: "🧑‍🎤", level: "A2" };
const QUESTIONS_PER_ROUND = 8;

function getLevel(xp) { return Math.floor(xp / 200) + 1; }
function xpToNextLevel(xp) { return 200 - (xp % 200); }
function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5); }

// ── ПРОГРАММА ОБУЧЕНИЯ ───────────────────────────────────────
// Типы заданий — scaffold для будущих упражнений
const EXERCISE_TYPES = {
  CHOOSE_TRANSLATION: { id: "choose_translation", label: "Выбери перевод", icon: "🔤", ready: true },
  BUILD_PHRASE:       { id: "build_phrase",        label: "Собери фразу",   icon: "🧩", ready: false },
  FILL_BLANK:         { id: "fill_blank",          label: "Вставь слово",   icon: "✏️",  ready: false },
  DIALOGUE_CHOICE:    { id: "dialogue_choice",     label: "Диалог",         icon: "💬", ready: false },
  LISTEN_CHOOSE:      { id: "listen_choose",       label: "Послушай",       icon: "🎧", ready: false },
  MINI_EXAM:          { id: "mini_exam",           label: "Мини-экзамен",   icon: "⚡", ready: true  },
};

const CURRICULUM_LEVELS = {
  PH: { color: "#06b6d4", label: "A1-1 · Базовый", short: "A1·1" },
  A1: { color: "#7C5CFC", label: "A1-2 · Элементарный", short: "A1·2" },
  PR: { color: "#8b5cf6", label: "A1-3 · Практический", short: "A1·3" },
  A2: { color: "#7C5CFC", label: "A1 · Часть 4", short: "A1·4" },
  A3: { color: "#7C5CFC", label: "A1 · Часть 5", short: "A1·5" },
  A4: { color: "#7C5CFC", label: "A1 · Часть 6", short: "A1·6" },
};

// TTS helper — использует Web SpeechSynthesis как fallback для аудио
// Tracks the currently playing Audio element for stop-before-play
let _currentAudio = null;

function isGermanText(text) {
  return !!text && !/[а-яА-ЯёЁ]/.test(text);
}

function speakDE(text, audioUrl) {
  // Guard: never speak Russian/Cyrillic text
  if (!audioUrl && !isGermanText(text)) {
    if (text) console.warn("Audio skipped: Russian text should not be spoken", text);
    return;
  }
  if (_currentAudio) { try { _currentAudio.pause(); _currentAudio.currentTime = 0; } catch(e) {} _currentAudio = null; }
  if (window.speechSynthesis) window.speechSynthesis.cancel();

  if (audioUrl) {
    const a = new Audio(audioUrl);
    _currentAudio = a;
    a.play().catch(() => { _currentAudio = null; if (isGermanText(text)) _speakTTS(text); });
    a.onended = () => { _currentAudio = null; };
  } else {
    _speakTTS(text);
  }
}

function _speakTTS(text) {
  if (!window.speechSynthesis || !text) return;
  const utt = new SpeechSynthesisUtterance(text);
  utt.lang = "de-DE";
  utt.rate = 0.85;
  window.speechSynthesis.speak(utt);
}

function AudioButton({ text, audioUrl, size = 28, style: extraStyle }) {
  const [playing, setPlaying] = useState(false);

  // Don't render button at all if there's nothing German to speak
  const canPlay = !!audioUrl || isGermanText(text);
  if (!canPlay) return null;

  function handlePlay(e) {
    e.stopPropagation();
    if (!canPlay) return;
    setPlaying(true);

    if (audioUrl) {
      if (_currentAudio) { try { _currentAudio.pause(); } catch(err) {} _currentAudio = null; }
      if (window.speechSynthesis) window.speechSynthesis.cancel();
      const a = new Audio(audioUrl);
      _currentAudio = a;
      a.play().catch(() => { _currentAudio = null; _speakTTS(text); setPlaying(false); });
      a.onended = () => { _currentAudio = null; setPlaying(false); };
      setTimeout(() => setPlaying(false), 3000);
    } else {
      if (_currentAudio) { try { _currentAudio.pause(); } catch(err) {} _currentAudio = null; }
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
        const utt = new SpeechSynthesisUtterance(text);
        utt.lang = "de-DE";
        utt.rate = 0.85;
        utt.onend = () => setPlaying(false);
        utt.onerror = () => setPlaying(false);
        window.speechSynthesis.speak(utt);
        setTimeout(() => setPlaying(false), 4000);
      } else {
        setPlaying(false);
      }
    }
  }

  return (
    <button
      onClick={handlePlay}
      style={{
        width: size, height: size,
        borderRadius: "50%",
        border: playing ? "1.5px solid #06b6d4" : "1.5px solid rgba(6,182,212,0.35)",
        background: playing ? "rgba(6,182,212,0.18)" : "rgba(6,182,212,0.07)",
        color: playing ? "#06b6d4" : "rgba(6,182,212,0.6)",
        cursor: "pointer",
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        fontSize: size * 0.45,
        transition: "all 0.2s",
        flexShrink: 0,
        padding: 0,
        ...(extraStyle || {}),
      }}
      title="Послушать произношение"
    >
      {playing ? "🔊" : "🔉"}
    </button>
  );
}

const CURRICULUM = [
  // ── A1-1 БАЗОВЫЙ: АЛФАВИТ И ПРОИЗНОШЕНИЕ (level: "PH") ────────
  {
    id: "alphabet",
    title: "Алфавит",
    emoji: "🔤",
    level: "PH",
    cards: [
      { title: "Буквы A–M", body: "A a — Apfel (яблоко)\nB b — Brot (хлеб)\nC c — Cent (цент)\nD d — Danke (спасибо)\nE e — Essen (еда)\nF f — Familie (семья)\nG g — gut (хорошо)\nH h — Hallo (привет)\nI i — ich (я)\nJ j — ja (да)\nK k — Kaffee (кофе)\nL l — lesen (читать)\nM m — Mutter (мать)" },
      { title: "Буквы N–Z", body: "N n — nein (нет)\nO o — Oma (бабушка)\nP p — Park (парк)\nQ q — Qualität (качество)\nR r — rot (красный)\nS s — Sonne (солнце)\nT t — Tee (чай)\nU u — Uhr (часы)\nV v — Vater (отец)\nW w — Wasser (вода)\nX x — Text (текст)\nY y — Yoga (йога)\nZ z — Zeit (время)" },
      { title: "Особые буквы: Ä Ö Ü ß", body: "Ä ä — Mädchen (девочка)\nÖ ö — schön (красивый)\nÜ ü — müde (усталый)\nß — Straße (улица)\n\n💡 Ä, Ö, Ü называются умлауты.\nEszett пишется только строчной, заглавная — SS." },
    ],
    exam: [
      { q: "Как читается буква Z?", options: ["как «з»", "как «ц»", "как «с»", "как «й»"], answer: 1 },
      { q: "Как читается буква W?", options: ["как «ш»", "как «в»", "как «б»", "как «ф»"], answer: 1 },
      { q: "Как называются буквы Ä, Ö, Ü?", options: ["Умлауты", "Лигатуры", "Диграфы", "Ударные"], answer: 0 },
      { q: "Как читается ß (Eszett)?", options: ["как «ш»", "как «з»", "как «с»", "как «б»"], answer: 2 },
      { q: "Буква V обычно читается как:", options: ["«в»", "«б»", "«ф»", "«п»"], answer: 2 },
    ],
  },
  {
    id: "vowels",
    title: "Гласные звуки",
    emoji: "🗣️",
    level: "PH",
    cards: [
      { title: "Пять гласных и примеры", body: "A a — Apfel (яблоко)\nE e — Essen (еда)\nI i — ich (я)\nO o — Oma (бабушка)\nU u — Uhr (часы)\n\n💡 Каждая гласная может звучать коротко или долго." },
      { title: "Долгие и краткие гласные", body: "💡 Краткая гласная: слог звучит быстро — Essen, Hund, kalt.\n💡 Долгая гласная: слог тянется — See, Uhr, Saal.\n\nEssen — еда\nHund — собака\nkalt — холодный\nSee — озеро\nUhr — часы\nSaal — зал" },
    ],
    exam: [
      { q: "Какое слово начинается с гласной А?", options: ["Brot", "Apfel", "Zeit", "Hund"], answer: 1 },
      { q: "В слове «Uhr» какая гласная?", options: ["A", "E", "I", "U"], answer: 3 },
      { q: "Слово «ich» начинается с гласной:", options: ["A", "E", "I", "O"], answer: 2 },
      { q: "В слове «Essen» первая буква:", options: ["A", "E", "I", "U"], answer: 1 },
      { q: "Гласная в «See» (озеро) звучит:", options: ["коротко", "долго", "не произносится", "как «ш»"], answer: 1 },
    ],
  },
  {
    id: "umlauts",
    title: "Умлауты: ä, ö, ü",
    emoji: "🔔",
    level: "PH",
    cards: [
      { title: "Что такое умлаут", body: "💡 Умлаут — это точки над буквой, которые меняют её звук.\n\nä — Mädchen (девочка)\nö — schön (красивый)\nü — müde (усталый)\nspät — поздно\nöffnen — открывать\nfünf — пять" },
      { title: "Умлаут в парах слов", body: "💡 Умлаут часто появляется во множественном числе и в степенях сравнения.\n\nalt — старый\nälter — старше\nkalt — холодный\nKälte — холод\ngroß — большой\ngrößer — больше\nWort — слово\nWörter — слова\nMutter — мать\nMütter — матери" },
    ],
    exam: [
      { q: "Какой умлаут в слове «schön»?", options: ["ä", "ö", "ü", "ß"], answer: 1 },
      { q: "«Müde» значит:", options: ["красивый", "холодный", "усталый", "быстрый"], answer: 2 },
      { q: "«Mädchen» значит:", options: ["мальчик", "девочка", "ребёнок", "женщина"], answer: 1 },
      { q: "Умлаут — это:", options: ["заглавная буква", "точки над буквой, меняющие звук", "знак ударения", "уменьшительный суффикс"], answer: 1 },
      { q: "Буква ü произносится примерно как:", options: ["«о»", "«а»", "«ю» без й", "«э»"], answer: 2 },
    ],
  },
  {
    id: "eszett",
    title: "Буква ß и сочетание ss",
    emoji: "✍️",
    level: "PH",
    cards: [
      { title: "ß — Eszett", body: "💡 ß (Eszett) читается как «с». Бывает только строчной.\n💡 В Швейцарии не используют — пишут ss везде.\n\nStraße — улица\ngroß — большой\nheißen — называться\nweiß — белый" },
      { title: "ss и ß: разница", body: "💡 ss — после краткой гласной: wissen, Essen, dass.\n💡 ß — после долгой гласной: Straße, groß, heißen.\n\nwissen — знать\nEssen — еда\ndass — что\nStraße — улица\ngroß — большой\nheißen — называться" },
    ],
    exam: [
      { q: "Как читается ß?", options: ["как «ш»", "как «з»", "как «с»", "как «щ»"], answer: 2 },
      { q: "В каком слове есть ß?", options: ["Schule", "Straße", "Vater", "Zeit"], answer: 1 },
      { q: "ß встречается:", options: ["только заглавной", "только строчной", "и заглавной, и строчной", "только в Швейцарии"], answer: 1 },
      { q: "«Groß» значит:", options: ["маленький", "большой", "белый", "дорогой"], answer: 1 },
      { q: "Как называется буква ß?", options: ["Умлаут", "Лигатура", "Eszett / Scharfes S", "Диграф"], answer: 2 },
    ],
  },
  {
    id: "diphthongs",
    title: "Дифтонги: ei, ie, eu, äu",
    emoji: "🔗",
    level: "PH",
    cards: [
      { title: "ei и ie", body: "ei читается как «ай»:\nein — один / артикль «а»\nzwei — два\ndrei — три\nheiß — горячий\n\nie читается как долгое «и»:\nSie — она / Вы\nwie — как\nvier — четыре\nBier — пиво\n\n💡 Подсказка:\nei → «ай» (э перед и = ай)\nie → долгое «и» (и перед е = и-и)" },
      { title: "eu и äu", body: "eu читается примерно как «ой»:\nDeutsch — немецкий\nheute — сегодня\nneu — новый\neuro — евро\n\näu читается так же, как eu — «ой»:\nHäuser — дома\nBäume — деревья\nLäufer — бегун\n\n💡 äu и eu на слух одинаковы — оба «ой»!" },
    ],
    exam: [
      { q: "Как читается «ei»?", options: ["как «ай»", "как «и»", "как «ой»", "как «э»"], answer: 0 },
      { q: "Как читается «ie»?", options: ["как «ай»", "как долгое «и»", "как «ой»", "как «ш»"], answer: 1 },
      { q: "«Heute» содержит звук:", options: ["«ай»", "«и»", "«ой»", "«э»"], answer: 2 },
      { q: "В слове «vier» (четыре) «ie» звучит как:", options: ["«ай»", "«ой»", "долгое «и»", "«е»"], answer: 2 },
      { q: "«eu» и «äu» звучат:", options: ["одинаково — как «ой»", "по-разному", "eu = «ай», äu = «ой»", "eu = «и», äu = «э»"], answer: 0 },
    ],
  },
  {
    id: "consonants_wvzjh",
    title: "Согласные w, v, z, j, h",
    emoji: "🔤",
    level: "PH",
    cards: [
      { title: "w, v и z", body: "💡 w = «в»: Wasser, Wein. v = «ф»: Vater, vier. z = «ц»: Zeit, Zug.\n\nWasser — вода\nWein — вино\nWort — слово\nVater — отец\nvier — четыре\nVolk — народ\nZeit — время\nZug — поезд\nzwei — два" },
      { title: "j и h", body: "💡 j = «й»: ja, Jahr, jetzt.\n💡 h произносится в начале слога: Hallo, Haus, heute.\n💡 В середине слова h часто молчит: gehen, sehen.\n\nja — да\nJahr — год\njetzt — сейчас\nHallo — привет\nHaus — дом\nheute — сегодня\ngehen — идти\nsehen — видеть" },
    ],
    exam: [
      { q: "Как читается «w» в слове Wasser?", options: ["как «ш»", "как «в»", "как «б»", "как «ф»"], answer: 1 },
      { q: "Как читается «v» в слове Vater?", options: ["как «в»", "как «п»", "как «ф»", "как «б»"], answer: 2 },
      { q: "Как читается «z» в слове Zeit?", options: ["как «з»", "как «ц»", "как «с»", "как «ж»"], answer: 1 },
      { q: "Как читается «j» в слове ja?", options: ["как «ж»", "как «й»", "как «дж»", "как «и»"], answer: 1 },
      { q: "В слове «Zug» (поезд) первый звук:", options: ["«з»", "«ж»", "«ц»", "«с»"], answer: 2 },
    ],
  },
  {
    id: "clusters_sch",
    title: "Сочетания sch, ch, sp, st",
    emoji: "🔊",
    level: "PH",
    cards: [
      { title: "sch и ch", body: "💡 sch = «ш»: Schule, schön, Schwester.\n💡 ch мягкое (ich, recht) или глубокое (Buch, auch, noch).\n\nSchule — школа\nschön — красивый\nSchwester — сестра\nich — я\nrecht — правильно\nBuch — книга\nauch — тоже\nnoch — ещё" },
      { title: "sp и st в начале слова", body: "💡 sp в начале слова = «шп»: Sport, Sprache, spielen.\n💡 st в начале слова = «шт»: Straße, Student, Stadt.\n\nSport — спорт\nSprache — язык\nspielen — играть\nStraße — улица\nStudent — студент\nStadt — город" },
    ],
    exam: [
      { q: "«Schule» начинается со звука:", options: ["«с»", "«ц»", "«ш»", "«з»"], answer: 2 },
      { q: "«Sport» читается как:", options: ["«спорт»", "«шпорт»", "«цпорт»", "«зпорт»"], answer: 1 },
      { q: "«Straße» начинается со звука:", options: ["«ст»", "«шт»", "«сш»", "«цт»"], answer: 1 },
      { q: "«ch» в слове «ich» (я) звучит как:", options: ["«к»", "«ш»", "мягкое «хь»", "«с»"], answer: 2 },
      { q: "В каком слове есть звук «ш»?", options: ["Zeit", "Vater", "Schule", "Brot"], answer: 2 },
    ],
  },
  {
    id: "stress_intonation",
    title: "Ударение и интонация",
    emoji: "🎵",
    level: "PH",
    cards: [
      { title: "Ударение в словах", body: "💡 В немецком ударение чаще всего на первом слоге.\n💡 Иностранные слова могут иметь другое ударение: Student, Restaurant.\n\nHallo — привет\nKaffee — кофе\nArbeit — работа\nWasser — вода\nStudent — студент\nInformation — информация\nRestaurant — ресторан" },
      { title: "Интонация вопросов и утверждений", body: "💡 Утверждение: интонация вниз ↘. Вопрос без вопросительного слова: вверх ↗.\n\nIch bin Anna. — Я Анна.\nDas ist gut. — Это хорошо.\nWie heißt du? — Как тебя зовут?\nKommst du? — Ты идёшь?\nGuten Morgen! — Доброе утро!\nSprechen Sie Deutsch? — Вы говорите по-немецки?" },
    ],
    exam: [
      { q: "В слове «Kaffee» ударение на:", options: ["первом слоге (КА-ффее)", "втором слоге (ка-ФФЕ-е)", "оба слога равны", "ударения нет"], answer: 0 },
      { q: "Вопрос «Kommst du?» (без вопросительного слова) произносится:", options: ["с интонацией вниз ↘", "с интонацией вверх ↗", "ровно →", "не имеет значения"], answer: 1 },
      { q: "«Ich bin Anna» (утверждение) произносится:", options: ["с интонацией вниз ↘", "с интонацией вверх ↗", "ровно →", "с паузой"], answer: 0 },
      { q: "Иностранное слово «Student» имеет ударение:", options: ["на первом слоге (СТУ-дент)", "на втором слоге (сту-ДЕНТ)", "ударения нет", "оба слога равны"], answer: 1 },
      { q: "Какое правило ударения чаще работает в немецком?", options: ["на последнем слоге", "на первом слоге", "всегда на -ung", "на гласной"], answer: 1 },
    ],
  },
  {
    id: "reading_practice",
    title: "Чтение простых слов",
    emoji: "📖",
    level: "PH",
    cards: [
      { title: "Слова из пройденных тем", body: "Apfel — яблоко\nEssen — еда\nich — я\nOma — бабушка\nUhr — часы\nMädchen — девочка\nschön — красивый\nmüde — усталый\nStraße — улица\ngroß — большой" },
      { title: "Слова с трудными сочетаниями", body: "ein — один\nzwei — два\nSie — она / Вы\nDeutsch — немецкий\nheute — сегодня\nWasser — вода\nVater — отец\nZeit — время\nSchule — школа\nSport — спорт" },
    ],
    exam: [
      { q: "Как читается слово «Schule»?", options: ["«скуле»", "«шуле»", "«цуле»", "«кхуле»"], answer: 1 },
      { q: "Как читается слово «zwei»?", options: ["«звай»", "«цвай»", "«швай»", "«твай»"], answer: 1 },
      { q: "Как читается слово «Sport»?", options: ["«спорт»", "«шпорт»", "«цпорт»", "«зпорт»"], answer: 1 },
      { q: "В слове «Vater» буква V читается как:", options: ["«в»", "«п»", "«ф»", "«б»"], answer: 2 },
      { q: "Как читается «heute» (сегодня)?", options: ["«хейтэ»", "«хойтэ»", "«хийтэ»", "«хэутэ»"], answer: 1 },
    ],
  },
  {
    id: "phonics_exam",
    title: "Мини-экзамен: звуки и чтение",
    emoji: "📝",
    level: "PH",
    cards: [
      { title: "Повторение всего пройденного", body: "💡 Проверь себя: как читаются все буквы, дифтонги и сочетания.\n\nApfel — яблоко\nStraße — улица\nschön — красивый\nDeutsch — немецкий\nMädchen — девочка\nWasser — вода\nZeit — время\nheute — сегодня\nSchule — школа\nzwei — два\ngroß — большой\nVater — отец" },
    ],
    exam: [
      { q: "Как читается «ei»?", options: ["как «ай»", "как «и»", "как «у»", "как «э»"], answer: 0 },
      { q: "Как читается «ie»?", options: ["как «ай»", "как долгое «и»", "как «ой»", "как «ш»"], answer: 1 },
      { q: "В слове «Mädchen» какой умлаут?", options: ["ä", "ö", "ü", "нет умлаута"], answer: 0 },
      { q: "Что читается как «ш»?", options: ["sch", "ei", "ie", "z"], answer: 0 },
      { q: "Как читается немецкая z?", options: ["как «с»", "как «ц»", "как «ж»", "как «в»"], answer: 1 },
      { q: "Как читается «eu» в слове Deutsch?", options: ["«ой»", "«ай»", "«и»", "«ш»"], answer: 0 },
      { q: "В каком слове есть ß?", options: ["Straße", "Schule", "Vater", "Zug"], answer: 0 },
      { q: "Как читается «w» в Wasser?", options: ["как «в»", "как «ш»", "как «ц»", "как «й»"], answer: 0 },
      { q: "В каком слове есть звук «ш»?", options: ["Schule", "Wasser", "Vater", "Zeit"], answer: 0 },
      { q: "Умлаут — это:", options: ["заглавная буква", "точки над буквой, меняющие звук", "слово становится длиннее", "слово становится глаголом"], answer: 1 },
    ],
  },

  // ── A1-2 ЭЛЕМЕНТАРНЫЙ ──────────────────────────────────────────
  // ── 1. ЗНАКОМСТВО ─────────────────────────────────────────────
  {
    id: "greetings",
    title: "Знакомство",
    emoji: "👋",
    level: "A1",
    bonusTopicId: "greetings_dialect",
    cards: [
      { title: "Как поздороваться", body: "Hallo — Привет / Здравствуйте\nGuten Morgen — Доброе утро\nGuten Tag — Добрый день / Здравствуйте\nGuten Abend — Добрый вечер\nHi — Привет (очень неформально)" },
      { title: "Как попрощаться", body: "Tschüss — Пока\nAuf Wiedersehen — До свидания\nBis bald — До скорого\nBis morgen — До завтра\nGute Nacht — Спокойной ночи" },
      { title: "Как спросить «как дела»", body: "Wie geht es Ihnen? — Как у Вас дела? (официально)\nWie geht's? — Как дела? (неформально)\n\nОтветы:\nGut, danke! — Хорошо, спасибо!\nSehr gut! — Очень хорошо!\nEs geht. — Нормально / так себе.\nNicht so gut. — Не очень хорошо." },
    ],
    exam: [
      { q: "Как сказать «Добрый день» по-немецки?", options: ["Guten Tag", "Gute Nacht", "Auf Wiedersehen", "Tschüss"], answer: 0 },
      { q: "Что значит «Tschüss»?", options: ["Привет", "Пока", "Спасибо", "Пожалуйста"], answer: 1 },
      { q: "Как неформально спросить «как дела»?", options: ["Guten Morgen", "Auf Wiedersehen", "Wie geht's?", "Gute Nacht"], answer: 2 },
      { q: "«Bis bald» означает:", options: ["До завтра", "До свидания", "До скорого", "Спокойной ночи"], answer: 2 },
      { q: "Как ответить «Очень хорошо»?", options: ["Es geht.", "Nicht so gut.", "Danke schön.", "Sehr gut!"], answer: 3 },
    ],
  },
  // ── 2. ЖИВОЙ НЕМЕЦКИЙ (бонус) ─────────────────────────────────
  {
    id: "greetings_dialect",
    title: "Живой немецкий",
    emoji: "🎙️",
    level: "A1",
    bonus: true,
    linkedBonus: true,
    cards: [
      { title: "Бавария и Австрия", body: "💡 Это бонус — не нужно сразу запоминать всё идеально. Главное — узнавать эти слова, если услышишь их в Германии, Австрии или Швейцарии.\n\nGrüß Gott — Здравствуйте (Бавария и Австрия · официально)\nServus — Привет / Пока (Бавария и Австрия · неформально)\nGrüß di — Привет тебе (юг Германии / Австрия · неформально)\nPfiat di — Пока (юг Германии / Австрия · неформально)" },
      { title: "Швейцария и север", body: "Grüezi — Здравствуйте (Швейцария · официально)\nSali — Привет (Швейцария · неформально)\nAde — Пока (Швейцария / юг Германии)\nMoin — Привет (север Германии · часто в любое время суток)\nTach — Привет / Добрый день (разговорно · некоторые регионы)\n\n💡 Moin говорят в любое время суток — не только утром" },
      { title: "Неформальные и молодёжные", body: "Na? — Ну как? / Как дела? (повсеместно · очень коротко)\nAlles klar? — Всё нормально? (неформально)\nAlles gut? — Всё хорошо? (неформально)\nWas geht? — Как дела? / Что нового? (молодёжное · неформально)\nWas geht ab? — Что происходит? / Что нового? (очень неформально · молодёжное)\n\n💡 Na? можно использовать как приветствие, вопрос и ответ одновременно" },
    ],
    exam: [
      { q: "«Grüß Gott» характерно для:", options: ["Северной Германии", "Берлина", "Баварии и Австрии", "Швейцарии"], answer: 2 },
      { q: "«Moin» часто говорят:", options: ["только утром", "в любое время суток", "только вечером", "только в Баварии"], answer: 1 },
      { q: "«Servus» — это:", options: ["только приветствие", "только прощание", "и привет, и пока", "официальное обращение"], answer: 2 },
      { q: "«Grüezi» — типичное приветствие в:", options: ["Австрии", "Баварии", "Швейцарии", "Гамбурге"], answer: 2 },
      { q: "«Na?» как приветствие означает:", options: ["Нет", "Ну как дела?", "Спасибо", "Привет, давно не виделись"], answer: 1 },
    ],
  },
  // ── 3. SEIN И HABEN ───────────────────────────────────────────
  {
    id: "verbs_sein_haben",
    title: "Глаголы: sein и haben",
    emoji: "⚡",
    level: "A1",
    bonusTopicId: "verbs_bonus",
    cards: [
      { title: "Глагол sein (быть)", tip: "sein = «быть»\n\nОписывает, кто ты или что ты из себя представляешь.\n\nСпрягается по-особому — форму нужно просто запомнить.", body: "ich bin — я\ndu bist — ты\ner/sie/es ist — он/она/оно\nwir sind — мы\nihr seid — вы\nsie/Sie sind — они / Вы\n\nМини-словарик:\nmüde — усталый/усталая\nnett — милый/милая\nglücklich — счастливый/счастливая\ndie Lehrerin — учительница\nder Arzt — врач\n\nПримеры:\nIch bin müde. — Я устал/устала.\nDu bist nett. — Ты милый/милая.\nSie ist Lehrerin. — Она учительница.\nEr ist Arzt. — Он врач.\nIch bin glücklich. — Я счастлив/счастлива." },
      { title: "Глагол haben (иметь)", tip: "haben = «иметь»\n\nИспользуется для обозначения владения чем-либо.\n\nВместе с sein — один из двух важнейших глаголов немецкого языка.", body: "ich habe — у меня есть\ndu hast — у тебя есть\ner/sie/es hat — у него/неё есть\nwir haben — у нас есть\nihr habt — у вас есть\nsie/Sie haben — у них / у Вас есть\n\nМини-словарик:\ndas Buch — книга\nder Hunger — голод\ndie Zeit — время\ndas Haus — дом\n\nПримеры:\nIch habe ein Buch. — У меня есть книга.\nEr hat Hunger. — Он голоден. (букв: у него есть голод)\nWir haben Zeit. — У нас есть время.\nWir haben ein Haus. — У нас есть дом." },
      { title: "Sein vs Haben", tip: "sein — описывает состояние или кто ты есть.\nhaben — что у тебя есть.", body: "sein — состояние или личность:\nIch bin glücklich. — Я счастлив/счастлива.\nSie ist Lehrerin. — Она учительница.\n\nhaben — владение:\nIch habe Zeit. — У меня есть время.\nWir haben Hunger. — Мы голодны.\n\n💡 Hunger/Durst haben = быть голодным/жаждущим\nГде по-русски «мне холодно» — по-немецки «Ich habe Kälte»" },
    ],
    exam: [
      { q: "«Du ___ müde.» — вставь правильную форму sein:", options: ["bin", "bist", "ist", "sind"], answer: 1 },
      { q: "«Wir ___ ein Haus.» — вставь haben:", options: ["habe", "hast", "hat", "haben"], answer: 3 },
      { q: "«Er ___ Arzt.» — вставь sein:", options: ["bin", "bist", "ist", "sind"], answer: 2 },
      { q: "Как сказать «У неё есть книга»?", options: ["Sie ist ein Buch.", "Sie hat ein Buch.", "Sie haben ein Buch.", "Sie hast ein Buch."], answer: 1 },
      { q: "«Ich habe Hunger» буквально означает:", options: ["Я хочу есть", "У меня есть голод", "Мне нужна еда", "Я голодный человек"], answer: 1 },
    ],
  },
  // ── 4. АРТИКЛИ ────────────────────────────────────────────────
  {
    id: "articles",
    title: "Артикли",
    emoji: "📌",
    level: "A1",
    bonusTopicId: "articles_bonus",
    cards: [
      { title: "Три рода в немецком", tip: "В немецком у каждого слова есть род:\nder — мужской род\ndie — женский род\ndas — средний род\n\nЭто не логика — запоминай артикль вместе со словом.", fixedOptions: ["мужской род", "женский род", "средний род"], body: "der — мужской род\ndie — женский род\ndas — средний род\n\nПримеры:\nder Tisch — стол\ndie Frau — женщина\ndas Kind — ребёнок\n\n💡 Род надо учить вместе со словом — правил мало!" },
      { title: "Неопределённый артикль", tip: "ein/eine — как «a/an» в английском.\n\nМужской и средний род → ein\nЖенский род → eine", body: "ein/eine — «один, одна» (как «a/an» в английском)\n\nein Tisch — стол (м.р.)\nein Mann — мужчина (м.р.)\neine Frau — женщина (ж.р.)\nein Kind — ребёнок (ср.р.)\nein Buch — книга (ср.р.)\n\n⚠️ Мужской и средний → ein\nЖенский → eine" },
      { title: "Когда артикль не нужен", tip: "Артикль не ставится перед:\n• именами — Das ist Anna\n• профессиями — Ich bin Lehrerin\n• большинством стран — aus Deutschland\n\nЗапомни эти три случая — они встречаются постоянно.", body: "Артикль не ставится:\n\n• Перед именами: Das ist Anna.\n• После sein с профессией: Ich bin Lehrerin. / Er ist Arzt.\n• Перед большинством стран: Ich komme aus Deutschland.\n\n💡 Исключения со статьёй: die Schweiz, die Türkei, die USA\n\n⚠️ В других контекстах артикль может появляться:\nSie ist eine gute Lehrerin. — Она хорошая учительница." },
    ],
    exam: [
      { q: "Какой артикль у слова «Tisch» (стол)?", options: ["die", "das", "der", "ein"], answer: 2 },
      { q: "Какой артикль у слова «Frau» (женщина)?", options: ["der", "die", "das", "einen"], answer: 1 },
      { q: "Какой артикль у слова «Kind» (ребёнок)?", options: ["der", "die", "das", "eine"], answer: 2 },
      { q: "В «eine Frau» используется артикль:", options: ["der", "die", "das", "eine"], answer: 3 },
      { q: "В простой фразе «Ich bin Lehrerin» перед профессией артикль:", options: ["der", "die", "das", "не ставится"], answer: 3 },
    ],
  },
  // ── 5. СЕМЬЯ ──────────────────────────────────────────────────
  {
    id: "family",
    title: "Семья",
    emoji: "👨‍👩‍👧",
    level: "A1",
    bonusTopicId: "family_bonus",
    cards: [
      { title: "Члены семьи", body: "der Vater — отец\ndie Mutter — мать\nder Bruder — брат\ndie Schwester — сестра\nder Sohn — сын\ndie Tochter — дочь\ndie Eltern — родители (мн.ч.)\ndie Kinder — дети (мн.ч.)" },
      { title: "Расширенная семья", body: "der Großvater / Opa — дедушка\ndie Großmutter / Oma — бабушка\nder Onkel — дядя\ndie Tante — тётя\nder Cousin — двоюродный брат\ndie Cousine — двоюродная сестра\nder Mann / Ehemann — муж\ndie Frau / Ehefrau — жена" },
      { title: "Как рассказать о семье", body: "Ich habe einen Bruder. — У меня есть брат.\nIch habe eine Schwester. — У меня есть сестра.\nIch habe keine Geschwister. — У меня нет братьев и сестёр.\n\nMeine Familie ist groß. — Моя семья большая.\nMeine Familie ist klein. — Моя семья маленькая.\n\n⚠️ После «Ich habe» мужской артикль ein меняется на einen:\nein Bruder → Ich habe einen Bruder.\nПока просто запомни эту модель." },
    ],
    exam: [
      { q: "Как по-немецки «дочь»?", options: ["der Sohn", "die Tochter", "die Schwester", "die Mutter"], answer: 1 },
      { q: "«Die Eltern» — это:", options: ["дети", "родители", "бабушки и дедушки", "тёти и дяди"], answer: 1 },
      { q: "Как сказать «У меня есть сестра»?", options: ["Ich bin eine Schwester.", "Ich habe eine Schwester.", "Ich habe einen Schwester.", "Mein Schwester."], answer: 1 },
      { q: "«Opa» — разговорное слово для:", options: ["папы", "дяди", "дедушки", "брата"], answer: 2 },
      { q: "«Geschwister» значит:", options: ["сестра", "брат", "братья и сёстры", "родители"], answer: 2 },
    ],
  },
  // ── 6. ЧИСЛА 1–100 ────────────────────────────────────────────
  {
    id: "numbers",
    title: "Числа 1–100",
    bonusTopicId: "numbers_big",
    emoji: "🔢",
    level: "A1",
    cards: [
      { title: "Числа 1–10", body: "1 — eins\n2 — zwei\n3 — drei\n4 — vier\n5 — fünf\n6 — sechs\n7 — sieben\n8 — acht\n9 — neun\n10 — zehn" },
      { title: "Числа 11–20", body: "11 — elf\n12 — zwölf\n13 — dreizehn\n14 — vierzehn\n15 — fünfzehn\n16 — sechzehn\n17 — siebzehn\n18 — achtzehn\n19 — neunzehn\n20 — zwanzig\n\n💡 13–19: просто добавляй -zehn (= «-надцать»)" },
      { title: "Числа 21–100", body: "21 — einundzwanzig\n30 — dreißig\n40 — vierzig\n50 — fünfzig\n100 — hundert\n\n💡 В числах от 21 до 99 единицы называются перед десятками:\n25 = fünfundzwanzig (пять-и-двадцать)\nКак старорусское «пять да двадцать»!" },
    ],
    exam: [
      { q: "Как по-немецки «семь»?", options: ["sechs", "acht", "sieben", "neun"], answer: 2 },
      { q: "Что значит «zwölf»?", options: ["11", "12", "13", "20"], answer: 1 },
      { q: "Как будет «пятнадцать»?", options: ["fünfzehn", "fünfzig", "fünfundzwanzig", "fünf"], answer: 0 },
      { q: "«Dreißig» — это:", options: ["13", "30", "33", "300"], answer: 1 },
      { q: "Как сказать «двадцать один»?", options: ["zwanzigeins", "einzwanzig", "einundzwanzig", "zwanzigeiner"], answer: 2 },
    ],
  },
  {
    id: "numbers_big",
    title: "Большие числа и даты",
    emoji: "📅",
    level: "A1",
    bonus: true,
    linkedBonus: true,
    cards: [
      { title: "Числа 100–1 000 000 000", body: "100 — hundert\n200 — zweihundert\n1.000 — tausend\n1.000.000 — eine Million\n1.000.000.000 — eine Milliarde\n\n💡 В немецком разряды разделяются точкой (не запятой):\n1.000 = тысяча · 1.000.000 = миллион\n\n101 — hunderteins\n💡 einhundert и hundert — оба правильны" },
      { title: "Порядковые числительные", body: "Для дат и перечислений:\n\nder erste — первый (1.)\nder zweite — второй (2.)\nder dritte — третий (3.)\nder vierte — четвёртый (4.)\nder fünfte — пятый (5.)\n\n⚠️ dritte — исключение, остальные просто +te\n💡 С 4-го: основа + -te (vierte, fünfte...)" },
      { title: "Как называть год", body: "Годы читаются как два двузначных числа:\n\n1999 — neunzehnhundertneunundneunzig\n2014 — zweitausendvierzehn\n2000 — zweitausend\n\n💡 С 2000 года говорят «zweitausend + число»\nС 1100–1999 — «сотни + остаток»" },
      { title: "Даты", body: "der erste März — первое марта\nder zwölfte April — двенадцатое апреля\nder erste Dritte — первое третьего\n\n💡 Дата = порядковое числительное + месяц\nПишется с точкой: 1. März = der erste März\n\nBerlin, 12. April 2002\n= zwölfter April zweitausendzwei" },
      { title: "Дроби и время", body: "ein halb — половина\nein Viertel — четверть\ndrei Viertel — три четверти\n\n💡 Особенно важны для времени:\nhalb drei — половина третьего\nein Viertel nach drei — четверть четвёртого\ndrei Viertel vier — без четверти четыре" },
    ],
    exam: [
      { q: "Как по-немецки «тысяча»?", options: ["hundert", "tausend", "Million", "Milliarde"], answer: 1 },
      { q: "Как читается год «2014»?", options: ["zwanzigeins-vier", "zweitausendvierzehn", "zwei-null-eins-vier", "zweitausend-vierzehn"], answer: 1 },
      { q: "«Der dritte» — это:", options: ["второй", "третий", "четвёртый", "первый"], answer: 1 },
      { q: "«Heute ist der 1. März» значит:", options: ["Завтра первое марта", "Сегодня первое марта", "Вчера было первое марта", "Первое марта — праздник"], answer: 1 },
      { q: "«Ein halb» — это:", options: ["четверть", "треть", "половина", "целое"], answer: 2 },
      { q: "Как разделяются разряды чисел в немецком?", options: ["запятой (1,000)", "точкой (1.000)", "пробелом (1 000)", "апострофом (1'000)"], answer: 1 },
      { q: "«Eine Milliarde» — это:", options: ["миллион", "десять миллионов", "миллиард", "триллион"], answer: 2 },
      { q: "Порядковое от числа 4 (vierte) образуется:", options: ["исключение — dritte", "добавлением -te", "добавлением -ste", "добавлением -e"], answer: 1 },
    ],
  },
  // ── 7. ЦВЕТА ──────────────────────────────────────────────────
  {
    id: "colors",
    title: "Цвета",
    emoji: "🎨",
    level: "A1",
    bonusTopicId: "colors_bonus",
    cards: [
      { title: "Основные цвета", body: "schwarz — чёрный\nweiß — белый\ngrau — серый\nrot — красный\nblau — синий\ngrün — зелёный\ngelb — жёлтый\nbraun — коричневый" },
      { title: "Простые фразы с цветами", body: "Das ist rot. — Это красное / Это красного цвета.\nDas ist blau. — Это синее / Это синего цвета.\nDas ist grün. — Это зелёное / Это зелёного цвета.\nDas ist gelb. — Это жёлтое / Это жёлтого цвета.\nDas ist schwarz. — Это чёрное / Это чёрного цвета.\nDas ist weiß. — Это белое / Это белого цвета.\n\n💡 Цвет ставится после «ist» и не меняется." },
      { title: "Цвета и одежда", body: "Мини-словарик одежды:\ndas Hemd — рубашка\ndie Jacke — куртка\nder Hut — шляпа\ndas Kleid — платье\ndie Hose — брюки\nder Schuh — ботинок\n\nПредложения:\nDas Hemd ist blau. — Рубашка синяя.\nDie Jacke ist rot. — Куртка красная.\nDer Hut ist gelb. — Шляпа жёлтая.\nDas Kleid ist grün. — Платье зелёное.\nDie Hose ist grau. — Брюки серые.\nDer Schuh ist braun. — Ботинок коричневый.\n\n💡 Цвет стоит после «ist» и не изменяется." },
    ],
    exam: [
      { q: "Как по-немецки «красный»?", options: ["blau", "grün", "rot", "gelb"], answer: 2 },
      { q: "«Schwarz» означает:", options: ["белый", "серый", "чёрный", "коричневый"], answer: 2 },
      { q: "Как сказать «Это синее»?", options: ["Das ist blau.", "Das ist blue.", "Das bin blau.", "Das hat blau."], answer: 0 },
      { q: "«Weiß» — это:", options: ["серый", "белый", "жёлтый", "коричневый"], answer: 1 },
      { q: "«Braun» означает:", options: ["синий", "серый", "зелёный", "коричневый"], answer: 3 },
    ],
  },
  // ── 8. ПОРЯДОК СЛОВ И ВОПРОСЫ ─────────────────────────────────
  {
    id: "word_order",
    title: "Порядок слов и вопросы",
    emoji: "📐",
    level: "A1",
    bonusTopicId: "word_order_bonus",
    cards: [
      { title: "Глагол на втором месте", tip: "Главное правило немецкого:\nглагол всегда стоит на ВТОРОМ месте.\n\n«Второе место» — не всегда второе слово.\nПервое место может занимать группа слов.\n\nДаже если предложение начинается не с подлежащего.", body: "В немецком утверждении глагол стоит на 2-м месте:\n\nIch [1] bin [2] müde.\nHeute [1] bin [2] ich müde.\nAnna [1] hat [2] Zeit.\n\nМини-словарик:\nheute — сегодня\n\n💡 Что бы ни стояло на первом месте — глагол всегда второй!" },
      { title: "Вопросы с вопросительным словом", tip: "С вопросительным словом (wer, was, wo...):\nглагол на втором месте — как обычно.", body: "Мини-словарик:\nwer — кто\nwas — что\nwo — где\n\nПримеры:\nWer bist du? — Кто ты?\nWas ist das? — Что это?\nWo ist die Mutter? — Где мама?" },
      { title: "Вопросы без вопросительного слова", tip: "Без вопросительного слова:\nглагол на ПЕРВОМ месте, подлежащее — на втором.", body: "Глагол на первом месте:\n\nBist du müde? — Ты устал/устала?\nHast du Zeit? — У тебя есть время?\n\n💡 В таких вопросах ответ: Ja (да) или Nein (нет)." },
    ],
    exam: [
      { q: "В обычном немецком утверждении глагол стоит:", options: ["всегда первый", "на втором месте", "всегда последний", "где угодно"], answer: 1 },
      { q: "Выбери правильный порядок слов:", options: ["Ich heute bin müde.", "Heute ich bin müde.", "Heute bin ich müde.", "Bin heute ich müde."], answer: 2 },
      { q: "Как задать вопрос «У тебя есть время?»", options: ["Du hast Zeit?", "Hast du Zeit?", "Zeit du hast?", "Hast Zeit du?"], answer: 1 },
      { q: "«Что это?» по-немецки:", options: ["Wer bist du?", "Was ist das?", "Wo ist die Mutter?", "Bist du müde?"], answer: 1 },
      { q: "«Где мама?» по-немецки:", options: ["Was ist das?", "Wo ist die Mutter?", "Hast du Zeit?", "Wer bist du?"], answer: 1 },
    ],
  },
  // ── 9. ОТРИЦАНИЕ ──────────────────────────────────────────────
  {
    id: "negation",
    title: "Отрицание: nicht / kein",
    emoji: "🚫",
    level: "A1",
    cards: [
      { title: "nicht — отрицание глагола", tip: "nicht отрицает глагол, прилагательное или всё предложение.", body: "nicht — не\n\nIch bin nicht müde. — Я не устал/не устала.\nDas ist nicht gut. — Это нехорошо.\n\n💡 nicht обычно стоит после глагола или в конце предложения." },
      { title: "kein/keine — отрицание существительного", tip: "kein/keine отрицает существительное с неопределённым артиклем или без артикля.\n\nkein — мужской и средний род\nkeine — женский род и множественное число", body: "Ich habe kein Buch. — У меня нет книги.\nIch habe keine Zeit. — У меня нет времени.\nIch habe keine Geschwister. — У меня нет братьев и сестёр.\n\nkein = ein + не (м.р. и ср.р.)\nkeine = eine + не (ж.р. и мн.ч.)\n\n⚠️ Падежи подробнее будут позже — пока просто запомни модели." },
      { title: "nicht vs kein", tip: "Главный вопрос: что именно отрицаешь?\n\nГлагол или прилагательное → nicht\nСуществительное → kein/keine", body: "nicht — отрицает глагол или прилагательное:\nIch bin nicht müde. ✓\nDas ist nicht gut. ✓\n\nkein/keine — отрицает существительное:\nIch habe kein Buch. ✓\nIch habe keine Zeit. ✓\n\n❌ Не смешивай:\nIch habe nicht Buch. ✗\nIch bin kein müde. ✗" },
    ],
    exam: [
      { q: "«Ich bin ___ müde» (я не устал):", options: ["kein", "keine", "nicht", "nein"], answer: 2 },
      { q: "«Ich habe ___ Buch» (у меня нет книги):", options: ["nicht", "keine", "kein", "nein"], answer: 2 },
      { q: "«Ich habe ___ Zeit» (у меня нет времени):", options: ["nicht", "keine", "kein", "nein"], answer: 1 },
      { q: "Что обычно отрицает существительное?", options: ["nicht", "kein или keine", "guten", "bist"], answer: 1 },
      { q: "Что правильно?", options: ["Ich bin kein müde.", "Ich bin nicht müde.", "Ich habe nicht Buch.", "Ich habe nein Zeit."], answer: 1 },
    ],
  },
  // ── 10. ВНЕШНОСТЬ (бонус) ─────────────────────────────────────
  {
    id: "appearance",
    title: "Описание внешности",
    emoji: "🪞",
    level: "A1",
    bonus: true,
    cards: [
      { title: "Волосы и глаза", body: "blonde Haare — светлые волосы\nbraune Haare — каштановые волосы\nschwarze Haare — чёрные волосы\nrote Haare — рыжие волосы\ngraue Haare — седые волосы\n\nblaue Augen — голубые глаза\ngrüne Augen — зелёные глаза\nbraune Augen — карие глаза\n\n💡 Er hat braune Haare. — У него каштановые волосы." },
      { title: "Внешность", body: "groß — высокий\nklein — низкий\nschlank — стройный\ndick — толстый\njung — молодой\nalt — старый\nhübsch — симпатичный\nschön — красивый\n\n⚠️ Dick в немецком означает «толстый» — не «грубый» как в английском!" },
      { title: "Описать человека", body: "Er hat blaue Augen. — У него голубые глаза.\nSie hat braune Haare. — У неё каштановые волосы.\nEr ist groß. — Он высокий.\nSie ist jung. — Она молодая.\n\nWie sieht er aus? — Как он выглядит?\nWie sieht sie aus? — Как она выглядит?\n\n💡 aussehen — выглядеть (разделяемый глагол!)" },
    ],
    exam: [
      { q: "«Blonde Haare» — это:", options: ["чёрные волосы", "рыжие волосы", "светлые волосы", "седые волосы"], answer: 2 },
      { q: "«Braune Augen» — это:", options: ["голубые глаза", "зелёные глаза", "серые глаза", "карие глаза"], answer: 3 },
      { q: "«Wie sieht er aus?» значит:", options: ["Где он?", "Как его зовут?", "Как он выглядит?", "Сколько ему лет?"], answer: 2 },
      { q: "«Schlank» означает:", options: ["высокий", "толстый", "стройный", "низкий"], answer: 2 },
      { q: "Как сказать «У неё каштановые волосы»?", options: ["Sie ist braune Haare.", "Sie hat braune Haare.", "Ihre Haare braun.", "Sie trägt braune Haare."], answer: 1 },
    ],
  },
  {
    id: "food",
    title: "Еда и напитки",
    emoji: "🍽️",
    level: "PR",
    bonusTopicId: "german_cuisine",
    cards: [
      { title: "Основные продукты", body: "das Brot — хлеб\ndie Milch — молоко\ndas Wasser — вода\nder Kaffee — кофе\nder Tee — чай\ndas Fleisch — мясо\nder Käse — сыр\ndas Ei — яйцо\ndas Gemüse — овощи\ndas Obst — фрукты" },
      { title: "В кафе и ресторане", body: "Ich möchte... — Я бы хотел/хотела...\nEin Kaffee, bitte! — Кофе, пожалуйста!\nDie Speisekarte, bitte. — Карта блюд, пожалуйста.\nWas kostet das? — Сколько это стоит?\nDie Rechnung, bitte! — Счёт, пожалуйста!\nEs war sehr lecker! — Было очень вкусно!\n\n💡 Ich möchte... — готовая вежливая фраза для заказа.\nПозже мы разберём möchten подробнее." },
      { title: "Немецкие блюда", body: "die Brezel — крендель\ndie Wurst — колбаса\nder Döner — донер-кебаб\ndas Schnitzel — шницель\ndas Sauerkraut — квашеная капуста\nder Kartoffelsalat — картофельный салат\ndie Bratwurst — жареная колбаса\n\n💡 Döner — самый популярный фастфуд в Германии!\n\n⚠️ Wurst имеет десятки сортов — Bratwurst, Currywurst, Leberwurst..." },
    ],
    exam: [
      { q: "Как попросить счёт в ресторане?", options: ["Guten Morgen!", "Die Rechnung, bitte!", "Ich möchte essen.", "Was kostet das?"], answer: 1 },
      { q: "«Das Gemüse» — это:", options: ["фрукты", "мясо", "овощи", "хлеб"], answer: 2 },
      { q: "Как сказать «Я бы хотел кофе»?", options: ["Ich habe Kaffee.", "Ich bin Kaffee.", "Ich möchte Kaffee.", "Ich trinke Kaffee bitte."], answer: 2 },
      { q: "«Lecker» означает:", options: ["дорогой", "вкусный", "горячий", "холодный"], answer: 1 },
      { q: "«Das Ei» — это:", options: ["сыр", "молоко", "яйцо", "хлеб"], answer: 2 },
    ],
  },
  {
    id: "german_cuisine",
    title: "Немецкая кухня",
    emoji: "🥨",
    level: "PR",
    bonus: true,
    linkedBonus: true,
    cards: [
      { title: "Типичные блюда", body: "die Brezel — крендель\ndie Bratwurst — жареная колбаса\ndas Schnitzel — шницель\nder Döner — донер-кебаб\ndas Sauerkraut — квашеная капуста\nder Kartoffelsalat — картофельный салат\ndie Currywurst — колбаса карри\ndas Eisbein — рулька\n\n💡 Currywurst — берлинский фастфуд, изобретён в 1949 году!" },
      { title: "В пекарне", body: "das Brötchen — булочка\ndas Schwarzbrot — чёрный хлеб\nder Kuchen — торт / пирог\ndie Torte — торт (слоёный)\ndie Semmel — булочка (Бавария)\ndas Croissant — круассан\nder Bäcker — пекарь\ndie Bäckerei — пекарня\n\n💡 Немцы едят много хлеба! Более 300 сортов хлеба в Германии." },
      { title: "Традиции еды", body: "das Frühstück — завтрак (7-9 утра)\ndas Mittagessen — обед (12-14 часов)\ndas Abendbrot — ужин (18-20 часов)\n\nТипичный завтрак: Brötchen mit Butter und Käse\nТипичный обед: горячее блюдо\nТипичный ужин: холодные закуски, хлеб, колбаса\n\n⚠️ Abendbrot — буквально «вечерний хлеб»: ужин часто холодный!" },
    ],
    exam: [
      { q: "«Die Brezel» — это:", options: ["шницель", "колбаса", "крендель", "пирог"], answer: 2 },
      { q: "«Das Schwarzbrot» — это:", options: ["белый хлеб", "чёрный хлеб", "булочка", "пирог"], answer: 1 },
      { q: "«Das Abendbrot» — это:", options: ["завтрак", "обед", "полдник", "ужин"], answer: 3 },
      { q: "«Die Bäckerei» — это:", options: ["мясная лавка", "ресторан", "пекарня", "кондитерская"], answer: 2 },
      { q: "Currywurst особенно ассоциируется с:", options: ["Мюнхеном", "Гамбургом", "Берлином", "Кёльном"], answer: 2 },
    ],
  },

  // ── A1 продолжение ────────────────────────────────────────────
  {
    id: "professions",
    title: "Профессии",
    emoji: "💼",
    level: "PR",
    bonusTopicId: "professions_bonus",
    cards: [
      { title: "Профессии", body: "der Arzt / die Ärztin — врач\nder Lehrer / die Lehrerin — учитель\nder Ingenieur / die Ingenieurin — инженер\nder Koch / die Köchin — повар\nder Polizist / die Polizistin — полицейский\nder Krankenpfleger / die Krankenpflegerin — медбрат / медсестра\nder Verkäufer / die Verkäuferin — продавец\nder Student / die Studentin — студент\n\n💡 die Krankenschwester — тоже «медсестра», более старое слово" },
      { title: "Как говорить о профессии", body: "Ich bin Lehrerin. — Я учительница.\nEr ist Arzt. — Он врач.\nSie arbeitet als Köchin. — Она работает поваром.\n\n💡 Перед профессией НЕТ артикля:\nIch bin Arzt. ✓ (не «ein Arzt»)\n\nWas bist du von Beruf? — Кем ты работаешь?" },
      { title: "Место работы", body: "das Büro — офис\ndie Schule — школа\ndas Krankenhaus — больница\ndie Fabrik — завод\ndas Geschäft — магазин\ndie Firma — фирма / компания\ndas Restaurant — ресторан\n\nWo arbeitest du? — Где ты работаешь?\nIch arbeite in einer Schule. — Я работаю в школе.\nIch arbeite bei einer Firma. — Я работаю в фирме.\n\n💡 Здесь появляется форма einer. Пока запомни как готовую фразу, подробно о падежах — позже." },
    ],
    exam: [
      { q: "Как сказать «Я врач»?", options: ["Ich habe ein Arzt.", "Ich bin ein Arzt.", "Ich bin Arzt.", "Ich arbeite Arzt."], answer: 2 },
      { q: "«Die Ärztin» — это:", options: ["медсестра", "врач-женщина", "учительница", "студентка"], answer: 1 },
      { q: "Как спросить о профессии?", options: ["Was machst du?", "Was bist du von Beruf?", "Wo arbeitest du?", "Wie heißt du?"], answer: 1 },
      { q: "«Der Koch» — это:", options: ["врач", "учитель", "повар", "продавец"], answer: 2 },
      { q: "«Sie arbeitet als Lehrerin» значит:", options: ["Она учится", "Она работает учительницей", "Она была учительницей", "Она ищет работу"], answer: 1 },
    ],
  },
  {
    id: "weekdays",
    title: "Дни недели",
    emoji: "📅",
    level: "PR",
    bonusTopicId: "weekdays_bonus",
    cards: [
      { title: "Дни недели", body: "der Montag — понедельник\nder Dienstag — вторник\nder Mittwoch — среда\nder Donnerstag — четверг\nder Freitag — пятница\nder Samstag — суббота\nder Sonntag — воскресенье" },
      { title: "Как использовать дни", body: "Am Montag — в понедельник\nAm Wochenende — на выходных\nMontagmorgen — утро понедельника\n\n💡 Все дни мужского рода: der\nСокращения: Mo Di Mi Do Fr Sa So\n\nHeute ist Mittwoch. — Сегодня среда." },
      { title: "Распорядок дня", body: "Мини-словарик:\ngehen — идти\ndie Arbeit — работа\nSport haben — иметь тренировку\nFreunde treffen — встречаться с друзьями\nschlafen — спать\nlange — долго\n\nAm Montag gehe ich zur Arbeit. — В понедельник я иду на работу.\nAm Mittwoch habe ich Sport. — В среду у меня тренировка.\nAm Freitag treffe ich Freunde. — В пятницу я встречаюсь с друзьями.\nAm Wochenende schlafe ich lange. — На выходных я долго сплю.\n\n💡 Am Montag... — глагол всё равно на втором месте:\nAm Montag gehe ich... ✓ (не Ich gehe am Montag... только)" },
    ],
    exam: [
      { q: "Как по-немецки «пятница»?", options: ["Donnerstag", "Freitag", "Samstag", "Montag"], answer: 1 },
      { q: "«Am Montag» значит:", options: ["в понедельник", "с понедельника", "до понедельника", "в прошлый понедельник"], answer: 0 },
      { q: "Какой день идёт после Mittwoch?", options: ["Dienstag", "Donnerstag", "Freitag", "Montag"], answer: 1 },
      { q: "«Das Wochenende» — это:", options: ["будни", "выходные", "праздник", "отпуск"], answer: 1 },
      { q: "Какого рода все дни недели?", options: ["die", "das", "der", "разного рода"], answer: 2 },
    ],
  },
  {
    id: "months",
    title: "Месяцы и сезоны",
    emoji: "🗓️",
    level: "PR",
    bonusTopicId: "months_bonus",
    cards: [
      { title: "Месяцы", body: "Januar — январь\nFebruar — февраль\nMärz — март\nApril — апрель\nMai — май\nJuni — июнь\nJuli — июль\nAugust — август\nSeptember — сентябрь\nOktober — октябрь\nNovember — ноябрь\nDezember — декабрь" },
      { title: "Времена года", body: "der Frühling — весна\nder Sommer — лето\nder Herbst — осень\nder Winter — зима\n\nim Sommer — летом\nim Winter — зимой\n\n💡 Im Januar = в январе\n(im = in dem, предлог + артикль)" },
      { title: "Праздники и события", body: "Weihnachten — Рождество (24–26 декабря)\nSilvester — канун Нового года (31 декабря)\nOstern — Пасха (март/апрель)\nder Karneval — карнавал (февраль)\ndas Oktoberfest — Октоберфест (сентябрь-октябрь)\nder Nationalfeiertag — День единства (3 октября)\n\n💡 В Германии главный праздник — Heilige Abend (24-е)!\nOktoberfest начинается в сентябре — несмотря на название." },
    ],
    exam: [
      { q: "Как по-немецки «март»?", options: ["Mai", "März", "April", "Februar"], answer: 1 },
      { q: "«Im Sommer» значит:", options: ["весной", "осенью", "летом", "зимой"], answer: 2 },
      { q: "«Der Herbst» — это:", options: ["весна", "лето", "осень", "зима"], answer: 2 },
      { q: "Как сказать «в декабре»?", options: ["am Dezember", "im Dezember", "in Dezember", "der Dezember"], answer: 1 },
      { q: "Какой месяц идёт после Juli?", options: ["Juni", "September", "August", "Oktober"], answer: 2 },
    ],
  },
  {
    id: "time",
    title: "Который час",
    emoji: "🕐",
    level: "PR",
    bonusTopicId: "time_bonus",
    cards: [
      { title: "Как спросить время", body: "Wie viel Uhr ist es? — Который час?\nWie spät ist es? — Сколько времени?\n\nEs ist... — Сейчас...\nein Uhr — час\nzwei Uhr — два часа\ndrei Uhr — три часа\nzwölf Uhr — двенадцать часов" },
      { title: "Минуты и части дня", body: "Es ist halb drei. — Половина третьего (2:30)\nEs ist Viertel nach vier. — Четверть пятого (4:15)\nEs ist Viertel vor fünf. — Без четверти пять (4:45)\n\n💡 halb drei = половина ДО трёх = 2:30\nОтличается от русского!" },
      { title: "Официальное время", body: "В официальных ситуациях (транспорт, ТВ) используют 24-часовой формат:\n\nEs ist 14:30 Uhr — vierzehn Uhr dreißig\nEs ist 09:00 Uhr — neun Uhr\nEs ist 21:15 Uhr — einundzwanzig Uhr fünfzehn\nEs ist 00:00 Uhr — null Uhr / Mitternacht\n\n💡 В расписаниях всегда 24ч формат:\nDer Zug fährt um 18:45 Uhr ab.\n\n⚠️ На вокзале не говорят «halb sieben» — только «18:30 Uhr»!" },
    ],
    exam: [
      { q: "Как спросить «который час»?", options: ["Was Uhr ist es?", "Wie viel Uhr ist es?", "Wann ist es?", "Wie heißt die Uhr?"], answer: 1 },
      { q: "«Es ist halb drei» — это:", options: ["3:00", "3:30", "2:30", "2:15"], answer: 2 },
      { q: "«Viertel nach vier» — это:", options: ["3:45", "4:15", "4:45", "5:15"], answer: 1 },
      { q: "«Es ist zwei Uhr» значит:", options: ["два часа", "второй час", "в два часа", "около двух"], answer: 0 },
      { q: "«Viertel vor fünf» — это:", options: ["5:15", "4:45", "5:45", "4:15"], answer: 1 },
    ],
  },
  {
    id: "hobbies",
    title: "Хобби и свободное время",
    emoji: "🎮",
    level: "PR",
    bonusTopicId: "hobbies_bonus",
    cards: [
      { title: "Хобби", body: "lesen — читать\nMusik hören — слушать музыку\nfernsehen — смотреть телевизор\nSport treiben — заниматься спортом\nkochen — готовить\nreisen — путешествовать\nzeichnen — рисовать\ntanzen — танцевать\nsingen — петь\nspielen — играть" },
      { title: "Как говорить о хобби", body: "Ich lese gern. — Я люблю читать.\nIch spiele gern Fußball. — Я люблю играть в футбол.\nIch mag Musik. — Мне нравится музыка.\n\n💡 gern = охотно, с удовольствием\nIch ... gern = Я люблю...\n\nWas machst du in der Freizeit?\nЧто ты делаешь в свободное время?" },
      { title: "Спорт в Германии", body: "der Fußball — футбол\nder Handball — гандбол\ndas Radfahren — езда на велосипеде\ndas Wandern — пешеходный туризм\ndas Schwimmen — плавание\nder Wintersport — зимний спорт\n\n💡 Fußball — самый популярный спорт в Германии!\nDie Bundesliga — немецкая футбольная лига\n\nIch fahre gern Rad. — Я люблю ездить на велосипеде.\nIch gehe gern wandern. — Я люблю ходить в походы." },
    ],
    exam: [
      { q: "«Ich lese gern» значит:", options: ["Я умею читать", "Я люблю читать", "Я читаю сейчас", "Я буду читать"], answer: 1 },
      { q: "«Fernsehen» — это:", options: ["читать", "готовить", "смотреть телевизор", "путешествовать"], answer: 2 },
      { q: "«Sport treiben» значит:", options: ["смотреть спорт", "заниматься спортом", "говорить о спорте", "любить спорт"], answer: 1 },
      { q: "Как сказать «Я люблю танцевать»?", options: ["Ich tanze nicht.", "Ich kann tanzen.", "Ich tanze gern.", "Ich möchte tanzen."], answer: 2 },
      { q: "«Die Freizeit» — это:", options: ["работа", "учёба", "свободное время", "выходные"], answer: 2 },
    ],
  },
  {
    id: "modal_verbs",
    title: "Модальные глаголы",
    emoji: "🔑",
    level: "PR",
    bonusTopicId: "modal_verbs_bonus",
    cards: [
      { title: "können, müssen, wollen", tip: "Модальные глаголы выражают отношение к действию:\nможно, нужно, хочу, разрешено.\n\nСам глагол действия уходит в КОНЕЦ предложения в форме инфинитива.\n\nЭто один из ключевых паттернов немецкого.", body: "können — мочь, уметь\nIch kann schwimmen. — Я умею плавать.\n\nmüssen — должен, нужно\nIch muss arbeiten. — Мне нужно работать.\n\nwollen — хотеть\nIch will nach Berlin. — Я хочу в Берлин.\n\ndürfen — иметь право, разрешено\nDarf ich hier sitzen? — Можно я здесь сяду?" },
      { title: "Формы модальных глаголов", tip: "Все модальные спрягаются похоже:\nich и er/sie/es имеют одинаковую форму.\n\nИнфинитив основного глагола\nвсегда идёт в самый конец предложения.", body: "können: ich kann, du kannst, er/sie kann\nmüssen: ich muss, du musst, er/sie muss\nwollen: ich will, du willst, er/sie will\ndürfen: ich darf, du darfst, er/sie darf\n\n💡 Инфинитив идёт В КОНЕЦ предложения:\nIch kann heute nicht kommen.\nМне не удастся прийти сегодня." },
      { title: "möchten и sollen", tip: "möchten — вежливое «хотел бы»\n(мягче и культурнее, чем wollen).\n\nsollen — «должен по чужому приказу»\n(кто-то другой это требует от тебя).\n\nЭто тонкое различие важно в немецкой культуре.", body: "möchten — хотел бы (вежливое желание)\nIch möchte einen Kaffee. — Я бы хотел кофе.\n\nmöchte — я бы хотел\nmöchtest — ты бы хотел\nmöchte — он/она бы хотел\n\nsollen — должен (по чужому требованию)\nIch soll um 8 da sein. — Мне велели быть там в 8.\n\nsoll — я должен\nsollst — ты должен\nsoll — он/она должен\n\n💡 möchten = вежливее чем wollen!" },
    ],
    exam: [
      { q: "«Ich kann Deutsch sprechen» значит:", options: ["Я хочу говорить по-немецки", "Я могу говорить по-немецки", "Я должен говорить по-немецки", "Я не говорю по-немецки"], answer: 1 },
      { q: "«Du ___ das Buch lesen» (должен) — вставь:", options: ["kannst", "willst", "musst", "darfst"], answer: 2 },
      { q: "Где стоит инфинитив с модальным глаголом?", options: ["В начале", "На втором месте", "В конце", "После подлежащего"], answer: 2 },
      { q: "«Darf ich...?» используют когда:", options: ["хотят что-то", "спрашивают разрешение", "описывают умение", "говорят об обязанности"], answer: 1 },
      { q: "«Ich will schlafen» значит:", options: ["Я должен спать", "Я умею спать", "Я хочу спать", "Я могу спать"], answer: 2 },
    ],
  },
  {
    id: "polite_german",
    title: "Вежливый немецкий",
    emoji: "🎩",
    level: "PR",
    bonus: true,
    cards: [
      { title: "Sie и du", body: "du — неформальное обращение (друзья, семья, дети)\nSie — формальное обращение (незнакомые, начальник, пожилые)\n\nWie heißt du? — Как тебя зовут?\nWie heißen Sie? — Как вас зовут?\n\nKannst du mir helfen? — Ты можешь мне помочь?\nKönnen Sie mir helfen? — Вы можете мне помочь?\n\n⚠️ Sie (формальное) всегда пишется с большой буквы!" },
      { title: "Вежливые фразы", body: "Entschuldigung! — Извините!\nEs tut mir leid. — Мне очень жаль.\nDarf ich...? — Разрешите...?\nEinen Moment bitte. — Одну минуту, пожалуйста.\nNatürlich! — Конечно!\nSelbstverständlich! — Разумеется!\n\n💡 Darf ich...? — самый вежливый способ спросить разрешение\nEntschuldigung используют и как «извините», и чтобы привлечь внимание" },
      { title: "Bitte и Danke", body: "Bitte! — Пожалуйста!\nDanke! — Спасибо!\nDanke schön! — Большое спасибо!\nBitte schön! — Пожалуйста!\nGern geschehen! — С удовольствием!\nKeine Ursache! — Не за что!\nBitte sehr! — Пожалуйста (ответ на спасибо)\n\n💡 В Германии говорят «bitte» и когда просят, и когда отвечают на «danke»!" },
    ],
    exam: [
      { q: "Когда используют «Sie» вместо «du»?", options: ["С детьми", "С друзьями", "В формальной обстановке", "В семье"], answer: 2 },
      { q: "«Es tut mir leid» значит:", options: ["Спасибо", "Пожалуйста", "Мне очень жаль", "Не за что"], answer: 2 },
      { q: "«Gern geschehen» — это ответ на:", options: ["Извините", "Спасибо", "Здравствуйте", "До свидания"], answer: 1 },
      { q: "«Darf ich...?» используют для:", options: ["приветствия", "просьбы о разрешении", "прощания", "описания"], answer: 1 },
      { q: "Формальное «Sie» в немецком пишется:", options: ["с маленькой буквы", "с большой буквы", "заглавными", "курсивом"], answer: 1 },
    ],
  },
  {
    id: "shopping",
    title: "В магазине",
    emoji: "🛒",
    level: "PR",
    bonusTopicId: "shopping_bonus",
    cards: [
      { title: "Покупки", body: "Was kostet das? — Сколько это стоит?\nWie viel kostet...? — Сколько стоит...?\nDas ist zu teuer. — Это слишком дорого.\nIch nehme das. — Я это возьму.\nHaben Sie...? — У вас есть...?\nWo ist die Kasse? — Где касса?\nEin Pfund — полкило, 500 г (разговорно)" },
      { title: "Деньги и цены", body: "der Euro — евро\nder Cent — цент\nEs kostet 5 Euro. — Это стоит 5 евро.\nBezahlen Sie bar oder mit Karte?\nВы платите наличными или картой?\n\nbar — наличными\nmit Karte — картой\nDas Wechselgeld — сдача" },
      { title: "На рынке и в супермаркете", body: "der Markt — рынок\nder Supermarkt — супермаркет\ndie Bäckerei — булочная\ndie Metzgerei — мясная лавка\n\nНа рынке: свежие продукты, торговля, можно торговаться\nВ супермаркете: фиксированные цены, самообслуживание\nВ булочной: свежий хлеб, Brötchen каждое утро\n\n💡 Samstag — лучший день для рынка в Германии!\nÖffnungszeiten — часы работы\n\n⚠️ Многие магазины закрыты по воскресеньям!" },
    ],
    exam: [
      { q: "Как спросить «Сколько стоит?»", options: ["Was haben Sie?", "Was kostet das?", "Wo ist das?", "Was möchten Sie?"], answer: 1 },
      { q: "«Wo ist die Kasse?» значит:", options: ["Где выход?", "Где касса?", "Где товар?", "Где магазин?"], answer: 1 },
      { q: "«Bar bezahlen» значит:", options: ["платить картой", "платить наличными", "не платить", "платить онлайн"], answer: 1 },
      { q: "«Das ist zu teuer» значит:", options: ["Это дёшево", "Это бесплатно", "Это слишком дорого", "Это хорошая цена"], answer: 2 },
      { q: "«Das Wechselgeld» — это:", options: ["цена", "скидка", "сдача", "чек"], answer: 2 },
    ],
  },
  {
    id: "clothes",
    title: "Одежда",
    emoji: "👕",
    level: "PR",
    bonusTopicId: "clothes_bonus",
    cards: [
      { title: "Предметы одежды", body: "das T-Shirt — футболка\ndie Hose — брюки\ndas Kleid — платье\nder Rock — юбка\ndie Jacke — куртка\nder Mantel — пальто\ndie Schuhe — туфли / обувь\ndie Socken — носки\nder Hut — шляпа\ndie Mütze — шапка" },
      { title: "Покупка одежды", body: "Ich suche... — Я ищу...\nWelche Größe? — Какой размер?\nKann ich das anprobieren? — Можно примерить?\nDas passt gut! — Хорошо подходит!\nDas ist zu groß/klein. — Это слишком большое/маленькое.\nIch nehme es. — Я это возьму.\n\n💡 Kann ich das anprobieren? — готовая фраза для магазина." },
      { title: "Погода и одежда", body: "die Sonnenbrille — солнечные очки\ndie Stiefel — сапоги / ботинки\ntragen — носить\n\nBei Regen trage ich eine Jacke. — В дождь я ношу куртку.\nBei Sonne trage ich eine Sonnenbrille. — В солнце я ношу очки.\nBei Kälte trage ich einen Mantel. — В холод я ношу пальто.\nBei Schnee trage ich Stiefel. — В снег я ношу сапоги.\n\n💡 eine/einen — формы артикля. Пока запомни эти фразы как готовые выражения." },
    ],
    exam: [
      { q: "«Die Jacke» — это:", options: ["платье", "юбка", "куртка", "пальто"], answer: 2 },
      { q: "Как сказать «Можно примерить»?", options: ["Ich nehme es.", "Kann ich das anprobieren?", "Welche Größe?", "Das passt gut!"], answer: 1 },
      { q: "«Der Rock» — это:", options: ["брюки", "рубашка", "юбка", "шляпа"], answer: 2 },
      { q: "«Das passt gut» значит:", options: ["Это дорого", "Хорошо подходит", "Слишком маленькое", "Мне не нравится"], answer: 1 },
      { q: "«Die Schuhe» — это:", options: ["носки", "шапка", "обувь", "перчатки"], answer: 2 },
    ],
  },
  {
    id: "transport",
    title: "Транспорт",
    emoji: "🚌",
    level: "PR",
    bonusTopicId: "transport_bonus",
    cards: [
      { title: "Виды транспорта", body: "der Bus — автобус\ndie U-Bahn — метро\ndie S-Bahn — электричка\nder Zug — поезд\ndas Auto — машина\ndas Fahrrad — велосипед\ndas Taxi — такси\ndas Flugzeug — самолёт\nzu Fuß — пешком\n\n💡 Некоторые фразы в этой теме — готовые выражения для поездок. Разбирать каждое слово пока не нужно." },
      { title: "На вокзале и остановке", body: "Wo fährt der Bus ab? — Откуда отходит автобус?\nEinen Fahrschein, bitte. — Один билет, пожалуйста.\nWann kommt der Zug an? — Когда прибывает поезд?\nEin Ticket nach Berlin. — Билет до Берлина.\nGleis 3 — третий путь (платформа)\numsteigen — пересаживаться\nder Umstieg — пересадка" },
      { title: "Как добраться", body: "Entschuldigung, wie komme ich zum Bahnhof?\nИзвините, как добраться до вокзала?\n\nGehen Sie geradeaus. — Идите прямо.\nBiegen Sie links ab. — Сверните налево.\nBiegen Sie rechts ab. — Сверните направо.\nDie erste Straße rechts. — Первая улица направо.\nEs ist in der Nähe. — Это рядом.\n\n⚠️ links / rechts abbiegen — «biegen Sie» для вежливого обращения!" },
    ],
    exam: [
      { q: "«Die U-Bahn» — это:", options: ["автобус", "трамвай", "метро", "поезд"], answer: 2 },
      { q: "«Zu Fuß gehen» значит:", options: ["ехать на машине", "идти пешком", "ехать на велосипеде", "бежать"], answer: 1 },
      { q: "«Umsteigen» значит:", options: ["купить билет", "опоздать", "пересаживаться", "выйти из поезда"], answer: 2 },
      { q: "«Das Flugzeug» — это:", options: ["поезд", "корабль", "самолёт", "автобус"], answer: 2 },
      { q: "«Wann kommt der Zug an?» значит:", options: ["Откуда едет поезд?", "Когда прибывает поезд?", "Где поезд?", "Как долго едет поезд?"], answer: 1 },
    ],
  },
  {
    id: "health",
    title: "Тело и здоровье",
    emoji: "🏥",
    level: "PR",
    bonusTopicId: "health_bonus",
    cards: [
      { title: "Части тела", body: "der Kopf — голова\ndas Auge — глаз\ndie Nase — нос\nder Mund — рот\ndas Ohr — ухо\nder Arm — рука (рука до плеча)\ndie Hand — кисть / рука\ndas Bein — нога\nder Fuß — стопа / ступня\nder Bauch — живот\nder Rücken — спина" },
      { title: "У врача", body: "Ich bin krank. — Я болен.\nMir ist schlecht. — Мне плохо / меня тошнит.\nIch habe Kopfschmerzen. — У меня болит голова.\nIch habe Fieber. — У меня температура.\nRufen Sie einen Arzt! — Вызовите врача!\n\n💡 Mir ist schlecht. и Rufen Sie einen Arzt! — готовые фразы для экстренных ситуаций.\n\n-schmerzen = боль в...\nKopfschmerzen — головная боль\nBauchschmerzen — боль в животе\nHalsschmerzen — боль в горле" },
      { title: "Аптека и лекарства", body: "die Apotheke — аптека\ndas Pflaster — пластырь\ndie Tablette — таблетка\ndas Medikament — лекарство\nder Hustensaft — сироп от кашля\ndie Salbe — мазь\ndas Rezept — рецепт\n\nIch brauche etwas gegen Kopfschmerzen. — Мне нужно что-то от головной боли.\nIch brauche etwas gegen Husten. — Мне нужно что-то от кашля.\n\n⚠️ В Германии многие лекарства только по рецепту (Rezept)!" },
    ],
    exam: [
      { q: "«Der Kopf» — это:", options: ["рука", "нога", "голова", "спина"], answer: 2 },
      { q: "«Ich habe Fieber» значит:", options: ["у меня насморк", "у меня температура", "я устал", "я голоден"], answer: 1 },
      { q: "«Mir ist schlecht» значит:", options: ["мне скучно", "мне плохо", "мне холодно", "мне жарко"], answer: 1 },
      { q: "«Halsschmerzen» — это боль в:", options: ["голове", "животе", "горле", "спине"], answer: 2 },
      { q: "«Das Bein» — это:", options: ["рука", "нога", "живот", "глаз"], answer: 1 },
    ],
  },

  // ── A1 БОНУСЫ ─────────────────────────────────────────────────
  { id: "articles_bonus", title: "Угадай род!", emoji: "🔍", level: "A1", bonus: true, linkedBonus: true,
    cards: [
      { title: "Правило -ung → die", tip: "Все слова на -ung — женского рода (die).\n\nЭто правило почти без исключений!\n\nНа карточке: слово без артикля → угадай der / die / das.", body: "Wohnung — die (квартира)\nZeitung — die (газета)\nMeinung — die (мнение)\nÜbung — die (упражнение)\nAbteilung — die (отдел)\nRechnung — die (счёт)\nWerbung — die (реклама)\nVerbindung — die (связь)" },
      { title: "Правило -heit / -keit → die", tip: "-heit и -keit — суффиксы абстрактных понятий.\n\nВсегда женский род (die).\n\nЧасто обозначают качество или состояние.", body: "Gesundheit — die (здоровье)\nFreiheit — die (свобода)\nSicherheit — die (безопасность)\nEinheit — die (единство)\nKrankheit — die (болезнь)\nMöglichkeit — die (возможность)\nFreundlichkeit — die (дружелюбие)\nPersönlichkeit — die (личность)" },
      { title: "Правило -chen/-lein → das", tip: "Уменьшительные суффиксы -chen и -lein — всегда средний род (das).\n\nДаже если слово обозначает женщину:\ndas Mädchen — девочка (das, не die!)", body: "Mädchen — das (девочка)\nHähnchen — das (цыплёнок)\nBrötchen — das (булочка)\nHündchen — das (собачка)\nKätzchen — das (кошечка)\nFräulein — das (девушка)\nTischchen — das (столик)\nKindlein — das (ребёночек)" },
      { title: "Правило -er → der", tip: "Слова с суффиксом -er (чаще всего профессии и деятели) — мужского рода (der).\n\nЖенская форма: добавь -in.\nLehrer → die Lehrerin", body: "Lehrer — der (учитель)\nFahrer — der (водитель)\nArbeiter — der (рабочий)\nSänger — der (певец)\nBäcker — der (пекарь)\nFehler — der (ошибка)\nComputer — der (компьютер)\nSommer — der (лето)" },
    ],
  },
  { id: "family_bonus", title: "Родня и обращения", emoji: "👨‍👩‍👧‍👦", level: "A1", bonus: true, linkedBonus: true,
    cards: [
      { title: "Свойственники", body: "der Schwiegervater — тесть / свёкор\ndie Schwiegermutter — тёща / свекровь\nder Schwager — шурин / зять / деверь\ndie Schwägerin — золовка / свояченица\nder Neffe — племянник\ndie Nichte — племянница\nder Enkelsohn — внук\ndie Enkeltochter — внучка\n\n💡 Schwieger- = родственники мужа/жены" },
      { title: "Семейное положение", body: "ledig — холост / не замужем\nverheiratet — женат / замужем\ngeschieden — разведён / разведена\nverwitwet — вдовец / вдова\nverlobt — помолвлен/а\n\nMein Mann / meine Frau — мой муж / моя жена\nMein Partner / meine Partnerin — мой партнёр\nIch bin ein Einzelkind. — Я единственный ребёнок.\n\n💡 В Германии часто говорят «Partner» независимо от статуса отношений" },
      { title: "Обращения в семье", body: "Oma — бабушка (разговорное)\nOpa — дедушка (разговорное)\nMutti / Mama — мамочка\nVati / Papa — папочка\n\nWie viele Geschwister hast du? — Сколько у тебя братьев/сестёр?\nIch habe zwei Brüder und eine Schwester.\n\nUnsere Familie ist... groß / klein / typisch deutsch!\n\n💡 Немецкие семьи в среднем: 1-2 ребёнка. Großfamilie (большая семья) — редкость." },
    ],
  },
  { id: "colors_bonus", title: "Цвета в языке", emoji: "🌈", level: "A1", bonus: true, linkedBonus: true,
    cards: [
      { title: "Оттенки и сочетания", body: "hellblau — светло-голубой\ndunkelblau — тёмно-синий\nhellgrün — светло-зелёный\ndunkelgrün — тёмно-зелёный\ndunkelrot — тёмно-красный\nhellgrau — светло-серый\ndunkelgrau — тёмно-серый\nhellbraun — светло-коричневый\nschwarzweiß — чёрно-белый\n\n💡 hell- (светло-) и dunkel- (тёмно-) пишутся слитно:\nhellgrün, dunkelrot, hellgrau" },
      { title: "Идиомы с цветами", body: "blau sein — быть пьяным (буквально «быть синим»)\nRot sehen — видеть красное = злиться\ngrünes Licht geben — дать зелёный свет (одобрить)\nschwarz sehen — смотреть пессимистично\nRosa brille tragen — смотреть сквозь розовые очки\n\n💡 Синий в Германии = цвет опьянения!\nBist du blau? — Ты пьяный?" },
      { title: "Склонение цветов", body: "После sein — без окончания:\nDas Auto ist rot. Die Tür ist grün.\n\n⚠️ Перед существительным — с окончанием:\nein rotes Auto (ср.р., Nom.)\neine rote Tür (ж.р., Nom.)\nein roter Mantel (м.р., Nom.)\n\n💡 Окончание зависит от рода и падежа существительного\nДля A1 достаточно запомнить форму после «sein»!" },
    ],
  },
  { id: "verbs_bonus", title: "Важные глаголы", emoji: "🔧", level: "A1", bonus: true, linkedBonus: true,
    cards: [
      { title: "Глагол werden (становиться)", body: "werden — становиться / будущее время\n\nych werde — я становлюсь\ndu wirst — ты становишься\ner/sie wird — он/она становится\nwir werden — мы становимся\n\nIch werde Arzt. — Я стану врачом.\nEs wird kalt. — Становится холодно.\n\n💡 werden + Infinitiv = будущее:\nIch werde kommen. — Я приду." },
      { title: "wissen vs kennen", body: "wissen — знать факт\nIch weiß die Antwort. — Я знаю ответ.\nIch weiß, wo er ist. — Я знаю, где он.\n\nkennen — быть знакомым с\nIch kenne Berlin. — Я знаю Берлин (бывал).\nIch kenne ihn. — Я его знаю (знаком).\n\n⚠️ Распространённая ошибка:\n✗ Ich weiß Berlin.\n✓ Ich kenne Berlin.\n\nwissen: ich weiß, du weißt, er weiß — неправильный!" },
      { title: "gehen, fahren, kommen", body: "gehen — идти (пешком)\nIch gehe zur Schule. — Я иду в школу.\n\nfahren — ехать (транспорт или на велосипеде)\nIch fahre mit dem Bus. — Я еду на автобусе.\n\nkommen — приходить / приезжать\nIch komme aus Russland. — Я из России.\nKomm her! — Иди сюда!\n\n💡 Ich gehe einkaufen. — Я иду за покупками. (пешком)\nIch fahre einkaufen. — Я еду за покупками. (на машине)" },
    ],
  },
  { id: "word_order_bonus", title: "Порядок слов: детали", emoji: "🪟", level: "A1", bonus: true, linkedBonus: true,
    cards: [
      { title: "Разделяемые глаголы", tip: "Некоторые глаголы при спряжении разделяются:\nприставка уходит в конец предложения.\n\nЭто один из самых важных паттернов немецкого!", body: "aufstehen — вставать\nIch stehe um 7 auf. — Я встаю в 7.\n\nanrufen — звонить\nIch rufe dich an. — Я тебе позвоню.\n\nzumachen — закрывать\nEr macht die Tür zu. — Он закрывает дверь.\n\neinkaufen — делать покупки\nWir kaufen heute ein. — Мы сегодня идём за покупками.\n\n💡 Приставка — всегда в самый конец!" },
      { title: "Время перед местом", tip: "Когда в предложении есть и время, и место — сначала время, потом место.\n\nЭто простое правило работает почти всегда.", body: "Ich gehe heute ins Kino. — Я иду сегодня в кино.\nEr kommt morgen nach Hause. — Он приходит завтра домой.\nWir fahren am Samstag nach Berlin. — В субботу едем в Берлин.\nSie arbeitet täglich im Büro. — Она работает каждый день в офисе.\n\n💡 Сначала КОГДА, потом ГДЕ:\nheute (когда) + ins Kino (где) ✓" },
      { title: "Инверсия: не только подлежащее первым", tip: "Первым в предложении может стоять не только подлежащее, но и время или место.\n\nГлагол всё равно остаётся на втором месте — подлежащее просто сдвигается.", body: "Heute gehe ich einkaufen. — Сегодня я иду за покупками.\nMorgen kommt er. — Завтра он придёт.\nJetzt schlafe ich. — Сейчас я сплю.\nHier wohne ich. — Здесь я живу.\nAm Montag haben wir Deutsch. — В понедельник у нас немецкий.\n\n💡 Правило: что бы ни стояло первым — глагол всегда второй!" },
    ],
  },
  { id: "professions_bonus", title: "Женские формы", emoji: "👩‍⚕️", level: "PR", bonus: true, linkedBonus: true,
    cards: [
      { title: "Суффикс -in", body: "В немецком у каждой профессии есть женская форма:\n\nder Arzt → die Ärztin (врач)\nder Lehrer → die Lehrerin (учитель)\nder Koch → die Köchin (повар)\nder Bäcker → die Bäckerin (пекарь)\nder Ingenieur → die Ingenieurin\nder Verkäufer → die Verkäuferin\n\n💡 Обычно просто + -in\nИногда добавляется умлаут: Arzt → Ärztin, Koch → Köchin" },
      { title: "Особые формы", body: "der Kaufmann → die Kauffrau (бизнесмен/женщина)\nder Student → die Studentin\nder Polizist → die Polizistin\nder Journalist → die Journalistin\nder Musiker → die Musikerin\nder Sportler → die Sportlerin\n\n⚠️ Иногда нужен умлаут:\nder Arzt → die Ärztin\nder Koch → die Köchin\n\n💡 Не знаешь женскую форму? Попробуй добавить -in — в 80% случаев сработает!" },
      { title: "В разговоре", body: "Ich bin Ärztin. — Я врач (женщина говорит).\nIch bin Arzt. — Я врач (мужчина говорит).\n\n⚠️ Артикль НЕ используется с профессией:\n✗ Ich bin eine Ärztin.\n✓ Ich bin Ärztin.\n\nНо с прилагательным — артикль нужен:\nSie ist eine gute Ärztin. (она хороший врач)\n\nWas bist du von Beruf? — Кем ты работаешь?" },
    ],
  },
  { id: "weekdays_bonus", title: "Происхождение дней", emoji: "🗿", level: "PR", bonus: true, linkedBonus: true,
    cards: [
      { title: "Этимология дней недели", body: "Montag — Mondtag (день Луны)\nDienstag — Thingstag (день Thing — германское собрание)\nMittwoch — Mitte der Woche (середина недели)\nDonnerstag — Donnerstag (день Грома / Тора)\nFreitag — Freyatag (день Фреи — богини любви)\nSamstag — от «Sabbat» (день субботний)\nSonntag — Sonnentag (день Солнца)\n\n💡 Mittwoch — единственный день НЕ по планете или богу!" },
      { title: "Выражения с днями недели", body: "unter der Woche — в будние дни\nwerktags — в рабочие дни\nam Wochenende — на выходных\njeden Montag — каждый понедельник\nmontagmorgens — по утрам в понедельник\n\nLetzten Freitag... — В прошлую пятницу...\nNächsten Dienstag... — В следующий вторник...\nDiesen Donnerstag... — В этот четверг...\n\n💡 letzt-, nächst-, dies- + день недели без предлога!" },
      { title: "Типичная немецкая неделя", body: "Montag — Arbeit / Schule beginnt\nMittwoch — середина, часто спорт\nFreitag — Feierabend! встречи с друзьями\nSamstag — Wochenmarkt (рынок), Einkaufen\nSonntag — Familie, Ausflug, Ruhe\n\n⚠️ Sonntag — воскресенье в Германии:\nМагазины закрыты! Закон о тишине (Ruhezeit)\n13-15 и 22-7 — нельзя шуметь\n\n💡 Samstag называют также «Sonnabend» на севере Германии" },
    ],
  },
  { id: "months_bonus", title: "Праздники Германии", emoji: "🎉", level: "PR", bonus: true, linkedBonus: true,
    cards: [
      { title: "Рождество и Новый год", body: "der Advent — адвент (4 воскресенья до Рождества)\nder Adventskalender — адвент-календарь (с подарками!)\nder Weihnachtsmarkt — рождественская ярмарка\nder Weihnachtsbaum — ёлка (рождественское дерево)\nder Heilige Abend — сочельник (24 декабря)\nWeihnachten — Рождество (25-26 декабря)\nSilvester — канун Нового года (31 декабря)\nFeuerwerk — фейерверк\n\n💡 В Германии главный праздник — Heilige Abend (24-е), не 25-е!" },
      { title: "Весенние праздники", body: "der Karneval / Fasching — карнавал (январь-февраль)\nder Rosenmontag — «розовый понедельник» (главный день карнавала)\ndie Maske — маска\ndas Kostüm — костюм\nOstern — Пасха (март/апрель)\ndas Osterei — пасхальное яйцо\nder Osterhase — пасхальный заяц\n\n💡 Karneval особенно в Кёльне, Дюссельдорфе, Майнце!\nВ Баварии говорят Fasching, в остальных местах — Karneval" },
      { title: "Национальные праздники", body: "Tag der Deutschen Einheit — День единства Германии\n3. Oktober — годовщина воссоединения 1990 года\n\nOktoberfest — Октоберфест (Мюнхен)\nEnde September — Mitte Oktober\ndas Bierzelt — пивная палатка\ndie Dirndl / das Lederhosen — баварские костюмы\n\nTag der Arbeit — 1. Mai (День труда)\nWalpurgisnacht — 30. April (ночь ведьм)\n\n💡 Oktoberfest начинается В СЕНТЯБРЕ! Только последние 3 дня — в октябре." },
    ],
  },
  { id: "time_bonus", title: "Время в разговоре", emoji: "⏱️", level: "PR", bonus: true, linkedBonus: true,
    cards: [
      { title: "Наречия времени", body: "jetzt — сейчас\ngerade — прямо сейчас / как раз\nbald — скоро\ngleich — сразу / через минуту\nspäter — позже\nmorgen — завтра\ngestern — вчера\nvorgestern — позавчера\nübermorgen — послезавтра\n\n💡 gleich vs bald:\nIch komme gleich! — Иду! (буквально сейчас)\nIch komme bald. — Скоро приду. (через время)" },
      { title: "Как давно и на сколько", body: "seit einer Stunde — уже час (началось час назад)\nvor einer Stunde — час назад\nin einer Stunde — через час\neine Stunde lang — в течение часа\n\nseit gestern — со вчерашнего дня\nvor einer Woche — неделю назад\nin zwei Tagen — через два дня\n\n💡 seit + Präsens = действие началось в прошлом и продолжается:\nIch lerne seit drei Jahren Deutsch.\nЯ учу немецкий уже три года." },
      { title: "Частота и регулярность", body: "immer — всегда\nmeistens — большей частью / обычно\noft — часто\nmanchmal — иногда\nselten — редко\nnie / niemals — никогда\n\ntäglich — ежедневно\nwöchentlich — еженедельно\nmonatlich — ежемесячно\njährlich — ежегодно\n\n💡 В порядке частоты:\nimmer → meistens → oft → manchmal → selten → nie" },
    ],
  },
  { id: "clothes_bonus", title: "Мода и стиль", emoji: "👗", level: "PR", bonus: true, linkedBonus: true,
    cards: [
      { title: "Сезонная одежда", body: "die Regenjacke — дождевик (нужна всегда!)\nder Wintermantel — зимнее пальто\ndie Sommerjacke — лёгкая куртка\ndie Winterstiefel — зимние ботинки\nder Schal — шарф\ndie Handschuhe — перчатки\ndie Sonnenbrille — солнечные очки\nder Regenschirm — зонт\n\n💡 В Германии говорят: «Es gibt kein schlechtes Wetter,\nnur falsche Kleidung!» — Нет плохой погоды, есть плохая одежда!" },
      { title: "Немецкие бренды", body: "Adidas — основан в Херцогенаурахе (Бавария) в 1949\nPUMA — основан там же, братом основателя Adidas!\nHUGO BOSS — из Метцингена (Баден-Вюртемберг)\nBirkenstock — сандалии из Германии с 1774 года!\nLEICA — немецкие фотоаппараты (Wetzlar)\n\n💡 Adidas = Adi Dassler (имя основателя)\nPUMA = Rudolf Dassler (брат Ади)\nОба брата поссорились и основали конкурирующие фирмы!" },
      { title: "В магазине одежды", body: "Haben Sie das in Größe 40? — Есть размер 40?\nGibt es das in einer anderen Farbe? — Есть другой цвет?\nDas steht Ihnen gut! — Вам идёт!\nDas passt nicht. — Не подходит.\nIch schaue mich nur um. — Я только смотрю.\n\nГерманские размеры:\n36=XS, 38=S, 40=M, 42=L, 44=XL\n\n💡 В Германии можно вернуть товар в течение 14 дней\nбез объяснения причин (Widerrufsrecht)" },
    ],
  },
  { id: "health_bonus", title: "Медицина в Германии", emoji: "🏨", level: "PR", bonus: true, linkedBonus: true,
    cards: [
      { title: "Система здравоохранения", body: "die Krankenkasse — медицинская страховка\ngesetzlich versichert — обязательная страховка (AOK, TK...)\nprivat versichert — частная страховка\n\n⚠️ В Германии страховка ОБЯЗАТЕЛЬНА для всех!\n\nder Hausarzt — терапевт (первый врач)\nder Facharzt — узкий специалист\ndie Notaufnahme — скорая помощь\n\n💡 Сначала к Hausarzt, он направляет к Facharzt!\n⚠️ К специалисту без направления: как правило платно" },
      { title: "У врача", body: "Ich brauche einen Termin. — Мне нужна запись.\nIch bin krank geschrieben. — Я на больничном.\ndie Krankmeldung / das Attest — больничный лист\n\nWo tut es weh? — Где болит?\nSeit wann haben Sie die Schmerzen? — Как давно болит?\nIch habe Schmerzen seit... — У меня болит с...\n\n💡 Krankmeldung нужна с 3-го дня болезни!\nПервые 2 дня можно оставаться дома без справки." },
      { title: "Аптека и лекарства", body: "die Apotheke — аптека (только в аптеках!)\nrezeptpflichtig — по рецепту\nrezeptfrei — без рецепта\ndie Packung — упаковка\ndie Tablette — таблетка\ndas Zäpfchen — свечи\nder Saft — сироп\ndie Salbe — мазь\n\n⚠️ В Германии лекарства только в аптеках (не в супермаркетах)!\nАспирин, Paracetamol — без рецепта\nАнтибиотики, сильные обезболивающие — только по рецепту\n\n💡 Apotheke отличается от Drogerie (dm, Rossmann) — там только косметика!" },
    ],
  },
  { id: "shopping_bonus", title: "Торговля в Германии", emoji: "🏪", level: "PR", bonus: true, linkedBonus: true,
    cards: [
      { title: "Виды магазинов", body: "der Supermarkt — супермаркет (REWE, EDEKA)\nder Discounter — дискаунтер (ALDI, LIDL, PENNY)\ndie Drogerie — дрогерия (dm, Rossmann) — косметика\ndas Kaufhaus — универмаг (Kaufhof)\ndas Einkaufszentrum — торговый центр\nder Wochenmarkt — еженедельный рынок\n\n💡 ALDI и LIDL — дешевле, меньше выбора\nREWE и EDEKA — дороже, больше выбора, органика" },
      { title: "Система Pfand", body: "das Pfand — залог за тару\ndie Mehrwegflasche — многоразовая бутылка\ndie Einwegflasche — одноразовая бутылка\nder Pfandautomat — автомат для возврата\n\nPfand = 0,08€ (стекло), 0,25€ (пластик и жестянка)\n\n💡 В Германии обязательно сдавай бутылки!\nВ каждом супермаркете есть Pfandautomat\nПолучишь чек — скидка на следующую покупку\n\n⚠️ Не все бутылки с Pfand! Смотри значок на этикетке" },
      { title: "Особенности торговли", body: "Geschäftszeiten — часы работы\nЧасы работы: Mo-Sa ~8:00-20:00\nSonntag — воскресенье — магазины ЗАКРЫТЫ!\n(Sonntagsöffnungsverbot — запрет работы в воскресенье)\n\nИсключения: заправки, аэропорты, вокзалы\nПо праздникам — тоже закрыто!\n\n💡 Планируй покупки заранее!\nSamstag — лучший день для большой закупки\n\neine Tüte — пакет (платный)\neine eigene Tasche mitbringen — приноси свой пакет!" },
    ],
  },
  { id: "transport_bonus", title: "Deutsche Bahn", emoji: "🚄", level: "PR", bonus: true, linkedBonus: true,
    cards: [
      { title: "Типы поездов", body: "ICE — InterCityExpress (высокоскоростной, до 300 км/ч)\nIC / EC — InterCity / EuroCity (межгородской)\nRE — RegionalExpress (региональный скоростной)\nRB — RegionBahn (медленный региональный)\nS-Bahn — городская электричка\nU-Bahn — метро\nStraßenbahn — трамвай\n\n💡 ICE — самый быстрый: Берлин-Мюнхен за 4 часа!\nNetz = сеть. Das DB-Netz покрывает всю Германию" },
      { title: "Билеты и цены", body: "das Deutschlandticket — 49€/месяц (все местные поезда!)\nder Sparpreis — дешёвый билет (заранее)\nder Flexpreis — гибкий билет (можно перенести)\ndie BahnCard 25/50 — скидочная карта (25%/50%)\n\nEinfache Fahrt — в одну сторону\nHin- und Rückfahrt — туда и обратно\n\n💡 Deutschlandticket (D-Ticket) — революция 2023 года!\nРаботает на всех RE, RB, S-Bahn, U-Bahn, автобусах\nНЕ работает на ICE и IC!" },
      { title: "Практические фразы", body: "Die Verspätung — опоздание (часто!)\nDer Zug hat 15 Minuten Verspätung.\nПоезд опаздывает на 15 минут.\n\ndie Durchsage — объявление\nDer Anschluss — стыковочный поезд\nDie Erstattung — возврат денег\n\n⚠️ Deutsche Bahn часто опаздывает!\nПри опоздании >60 мин: 25% стоимости билета назад\nПри >120 мин: 50% назад — требуй Entschädigung!\n\n💡 App «DB Navigator» — лучшее приложение для поездок" },
    ],
  },
  { id: "hobbies_bonus", title: "Клубы и ферайны", emoji: "🤝", level: "PR", bonus: true, linkedBonus: true,
    cards: [
      { title: "Verein — клуб", body: "der Verein — клуб / объединение / ферайн\nIch bin im Verein. — Я состою в клубе.\ndem Verein beitreten — вступить в клуб\nden Verein verlassen — выйти из клуба\n\nArten von Vereinen:\nder Sportverein — спортивный клуб (FC Bayern!)\nder Musikverein — музыкальный коллектив\nder Schachverein — шахматный клуб\nder Gartenverein — садоводческое общество\n\n💡 В Германии более 600 000 Vereine!\nПочти каждый немец состоит в одном." },
      { title: "Популярные хобби", body: "das Wandern — пешеходный туризм (хобби #1!)\ndas Gärtnern / die Gartenarbeit — садоводство\ndas Lesen — чтение\ndas Kochen — кулинария\ndas Fotografieren — фотография\ndas Reisen — путешествия\ndas Ehrenamt — волонтёрство\n\n💡 Wandern — самое популярное хобби в Германии!\nder Wanderweg — туристическая тропа\ndie Wanderschuhe — треккинговые ботинки" },
      { title: "Как говорить о хобби", body: "Was machst du in deiner Freizeit? — Что ты делаешь в свободное время?\nIch treibe gern Sport. — Я занимаюсь спортом.\nIch bin leidenschaftlicher Leser. — Я заядлый читатель.\n\nHast du ein Hobby? — У тебя есть хобби?\nIch interessiere mich für... — Я интересуюсь...\nIch beschäftige mich mit... — Я занимаюсь...\n\n💡 leidenschaftlich — страстный, заядлый\nein Hobby haben vs einem Hobby nachgehen — оба правильны!\nIch gehe meinem Hobby nach. (следую своему хобби)" },
    ],
  },
  { id: "modal_verbs_bonus", title: "Модальные глаголы в жизни", emoji: "✨", level: "PR", bonus: true, linkedBonus: true,
    cards: [
      { title: "können — уметь или мочь?", tip: "können означает и «уметь» (навык), и «мочь» (обстоятельства).\n\nПо контексту сразу понятно, что имеется в виду.", body: "Ich kann schwimmen. — Я умею плавать.\nIch kann heute nicht. — Я не могу сегодня.\nKannst du mir helfen? — Ты можешь мне помочь?\nEr kann gut kochen. — Он умеет хорошо готовить.\nSie kann kein Deutsch. — Она не знает немецкого.\nKann ich bitte...? — Можно мне...?\n\n💡 Kann ich...? — вежливый способ что-то попросить" },
      { title: "müssen vs. nicht müssen", tip: "müssen = нужно / обязан.\n\nНО: nicht müssen = не нужно (НЕ «нельзя»!).\nnicht dürfen = нельзя — это другой глагол!", body: "Ich muss arbeiten. — Мне нужно работать.\nDu musst das nicht machen. — Тебе не нужно это делать.\nEr muss zum Arzt. — Ему нужно к врачу.\nWir müssen jetzt gehen. — Нам нужно идти.\n\nnicht müssen — не обязан\nnicht dürfen — нельзя\n\n💡 Du musst nicht = необязательно\nDu darfst nicht = запрещено" },
      { title: "wollen vs. möchten", tip: "Оба означают «хотеть», но по-разному звучат.\n\nwollen — прямо и настойчиво.\nmöchten — мягко и вежливо.\n\nВ магазине и кафе лучше использовать möchten.", body: "Ich will ein Eis. — Я хочу мороженое. (прямо)\nIch möchte ein Eis. — Я бы хотел мороженое. (вежливо)\n\nIch will nach Hause. — Хочу домой.\nIch möchte bitte zahlen. — Я бы хотел заплатить.\n\nWas willst du? — Чего ты хочешь?\nWas möchten Sie? — Что вы желаете?\n\n💡 В кафе и магазине говори möchten — это культурнее" },
    ],
  },

  // ── A2 ────────────────────────────────────────────────────────
  {
    id: "perfekt",
    title: "Прошедшее время (Perfekt)",
    emoji: "⏰",
    level: "A2",
    cards: [
      { title: "Как образуется Perfekt", body: "haben/sein + Partizip II\n\nIch habe gegessen. — Я поел.\nIch bin gegangen. — Я ушёл.\n\nПравило haben:\nIch habe gemacht — я сделал\nIch habe gekauft — я купил\n\nПравило sein (движение/изменение):\nIch bin gefahren — я поехал\nIch bin aufgestanden — я встал" },
      { title: "Partizip II: слабые глаголы", body: "Слабые глаголы — это «правильные» глаголы.\n\n📌 Схема: ge- + основа + -(e)t\n\nmachen → ge·mach·t\nkaufen → ge·kauf·t\narbeiten → ge·arbeit·et\n\n⚠️ -et добавляется если основа кончается на -t или -d:\narbeiten → gearbeitet (не gearbeit!)\n\n✅ Запомни схему: ge- + основа + -(e)t" },
      { title: "Partizip II: сильные глаголы", body: "Сильные глаголы меняют корень — их надо учить наизусть!\n\n📌 Схема: ge- + изменённый корень + -en\n\ngehen → ge·gang·en\nessen → ge·gess·en\nschreiben → ge·schrieb·en\nsehen → ge·seh·en\nkommen → ge·komm·en\n\n💡 Как неправильные глаголы в английском:\ngo → went, eat → ate" },
    ],
    exam: [
      { q: "«Ich habe gegessen» — это:", options: ["Я ем", "Я поел", "Я буду есть", "Я хочу есть"], answer: 1 },
      { q: "С каким вспомогательным глаголом используется «gehen» в Perfekt?", options: ["haben", "sein", "werden", "machen"], answer: 1 },
      { q: "Partizip II от «machen» — это:", options: ["gemacht", "gemachen", "macht", "mächte"], answer: 0 },
      { q: "«Ich bin gefahren» значит:", options: ["Я еду", "Я поехал", "Я хочу ехать", "Я умею ехать"], answer: 1 },
      { q: "Partizip II слабых глаголов образуется по схеме:", options: ["ge- + основа + -en", "ge- + основа + -(e)t", "основа + -t", "ge- + основа"], answer: 1 },
    ],
  },
  {
    id: "dativ",
    title: "Дательный падеж (Dativ)",
    emoji: "📦",
    level: "A2",
    cards: [
      { title: "Что такое Dativ", body: "Dativ = кому? чему?\n\nder → dem (м.р.)\ndie → der (ж.р.)\ndas → dem (ср.р.)\ndie (мн.ч.) → den + -n\n\nПримеры:\nIch helfe dem Mann. — Я помогаю мужчине.\nIch gebe der Frau das Buch. — Я даю женщине книгу.\nIch danke dem Kind. — Я благодарю ребёнка." },
      { title: "Предлоги с Dativ", body: "Предлоги которые ВСЕГДА требуют Dativ:\nmit — с (mit dem Bus)\nnach — после / в (nach der Schule)\nbei — у / при (bei meiner Mutter)\nvon — от / из (von dem Lehrer)\nzu — к / до (zu Hause)\naus — из (aus Deutschland)\nseit — с (с тех пор как)\naußer — кроме" },
      { title: "Dativ в речи", body: "Глаголы которые требуют Dativ:\nhelfen — помогать (Ich helfe dir.)\ndanken — благодарить (Ich danke Ihnen.)\ngehören — принадлежать (Das gehört mir.)\ngefallen — нравиться (Das gefällt mir.)\n\nМестоимения в Dativ:\nmir — мне\ndir — тебе\nuns — нам\nihm — ему\nihr — ей\nihnen / Ihnen — им / Вам\n\n💡 Das gefällt mir. = Мне это нравится. (буквально: нравится мне)" },
    ],
    exam: [
      { q: "«Dem» — это Dativ от:", options: ["die", "der/das", "die (мн.ч.)", "ein"], answer: 1 },
      { q: "«Ich helfe ___ Frau» — вставь артикль в Dativ:", options: ["die", "der", "das", "dem"], answer: 1 },
      { q: "Какой предлог ВСЕГДА требует Dativ?", options: ["durch", "für", "mit", "ohne"], answer: 2 },
      { q: "«Zu Hause» значит:", options: ["домой", "из дома", "дома", "у дома"], answer: 2 },
      { q: "«Seit» с Dativ означает:", options: ["после", "с (начало действия до сейчас)", "из", "у"], answer: 1 },
    ],
  },
  {
    id: "akkusativ",
    title: "Винительный падеж (Akkusativ)",
    emoji: "🎯",
    level: "A2",
    cards: [
      { title: "Что такое Akkusativ", body: "Akkusativ = кого? что?\n\nМеняется только мужской род:\nder → den\n\ndie → die (не меняется)\ndas → das (не меняется)\n\nПримеры:\nIch sehe den Mann. — Я вижу мужчину.\nIch kaufe die Tasche. — Я покупаю сумку.\nIch lese das Buch. — Я читаю книгу.\nein → einen (м.р.)" },
      { title: "Предлоги с Akkusativ", body: "Предлоги которые ВСЕГДА требуют Akkusativ:\ndurch — через (durch den Park)\nfür — для (für mich)\ngegen — против (gegen den Wind)\nohne — без (ohne dich)\num — вокруг (um die Ecke)\n\n💡 Запомни: durch-für-gegen-ohne-um\n= все с Akkusativ!" },
      { title: "Akkusativ в речи", body: "Akkusativ — прямое дополнение (кого? что?):\nIch sehe ihn. — Я его вижу.\nIch liebe dich. — Я тебя люблю.\nEr kauft es. — Он его покупает.\n\nМестоимения в Akkusativ:\nmich — меня\ndich — тебя\nuns — нас\nihn — его\nsie — её\nsie — их\n\n💡 Dativ vs Akkusativ:\nIch gebe dem Mann (Dat.) das Buch (Akk.).\nкому? = Dativ · что? = Akkusativ" },
    ],
    exam: [
      { q: "«Ich sehe ___ Mann» — вставь артикль в Akkusativ:", options: ["der", "dem", "den", "des"], answer: 2 },
      { q: "В Akkusativ меняется только:", options: ["мужской род", "женский род", "средний род", "все роды"], answer: 0 },
      { q: "«Für» требует:", options: ["Nominativ", "Dativ", "Akkusativ", "Genitiv"], answer: 2 },
      { q: "«Ohne dich» значит:", options: ["с тобой", "для тебя", "против тебя", "без тебя"], answer: 3 },
      { q: "«Einen» — это Akkusativ от:", options: ["die", "das", "ein (м.р.)", "kein"], answer: 2 },
    ],
  },
  {
    id: "separable_verbs",
    title: "Разделяемые глаголы",
    emoji: "✂️",
    level: "A2",
    cards: [
      { title: "Что такое разделяемые глаголы", body: "Приставка отделяется и идёт В КОНЕЦ:\n\naufstehen — вставать\nIch stehe um 7 auf. — Я встаю в 7.\n\nanrufen — звонить\nIch rufe dich an. — Я тебе позвоню.\n\neinkaufen — делать покупки\nIch kaufe heute ein. — Сегодня я иду за покупками.\n\nabfahren — отправляться\nDer Zug fährt um 10 ab." },
      { title: "Частые разделяемые глаголы", body: "aufmachen — открывать\nzumachen — закрывать\nankommen — прибывать\naussteigen — выходить (из транспорта)\neinsteigen — входить (в транспорт)\nfernsehen — смотреть телевизор\naufräumen — убирать (комнату)\nmitnehmen — брать с собой\n\n💡 В инфинитиве и Partizip II приставка сохраняется!" },
      { title: "Partizip II разделяемых глаголов", body: "В Partizip II приставка остаётся прикреплённой — ge- вставляется между приставкой и основой:\n\naufstehen — aufgestanden\nanrufen — angerufen\neinkaufen — eingekauft\naufräumen — aufgeräumt\nankommen — angekommen\naussteigen — ausgestiegen\n\n💡 Схема: приставка + ge + основа + en/t\nauf + ge + stand + en = aufgestanden\n\n⚠️ НЕ «geaufgestanden» — ge- всегда между приставкой и корнем!" },
    ],
    exam: [
      { q: "«Ich stehe um 7 ___» (aufstehen) — куда идёт приставка?", options: ["В начало", "После подлежащего", "В конец предложения", "После глагола"], answer: 2 },
      { q: "«Anrufen» значит:", options: ["приходить", "звонить", "отвечать", "кричать"], answer: 1 },
      { q: "«Der Zug fährt ab» — это форма глагола:", options: ["anfahren", "abfahren", "auffahren", "einfahren"], answer: 1 },
      { q: "«Aussteigen» значит:", options: ["входить в транспорт", "выходить из транспорта", "пересаживаться", "опаздывать"], answer: 1 },
      { q: "«Ich kaufe heute ein» — это форма глагола:", options: ["ankaufen", "aufkaufen", "einkaufen", "verkaufen"], answer: 2 },
    ],
  },
  {
    id: "weather",
    title: "Погода",
    emoji: "🌤️",
    level: "A2",
    cards: [
      { title: "Погода", body: "die Sonne — солнце\nder Regen — дождь\nder Schnee — снег\nder Wind — ветер\nder Nebel — туман\ndas Gewitter — гроза\ndie Wolke — облако\n\nEs ist sonnig. — Солнечно.\nEs regnet. — Идёт дождь.\nEs schneit. — Идёт снег.\nEs ist windig. — Ветрено." },
      { title: "Температура и прогноз", body: "Wie ist das Wetter heute? — Какая сегодня погода?\nEs ist warm/kalt/heiß. — Тепло/холодно/жарко.\nEs sind 20 Grad. — 20 градусов.\nDer Wetterbericht sagt... — Прогноз говорит...\n\nheiß — жарко (выше 30°)\nwarm — тепло (15-25°)\nkühl — прохладно (10-15°)\nkalt — холодно (ниже 10°)" },
      { title: "Погода в Германии", body: "Германия — умеренный климат:\nLenz (Frühling) — прохладная весна, часто дождь\nSommer — тёплое лето, до 30°\nHerbst — дождливая осень, туманы\nWinter — умеренно холодный, снег не всегда\n\nТипичная одежда:\nRegenjacke — дождевик (нужна часто!)\nPullover — свитер (для осени)\nSchal — шарф (для зимы)\n\n💡 В Германии говорят: «Es gibt kein schlechtes Wetter, nur schlechte Kleidung!»\nНет плохой погоды — только плохая одежда!" },
    ],
    exam: [
      { q: "«Es regnet» значит:", options: ["Идёт снег", "Идёт дождь", "Ветрено", "Солнечно"], answer: 1 },
      { q: "«Das Gewitter» — это:", options: ["туман", "облако", "гроза", "ветер"], answer: 2 },
      { q: "Как спросить о погоде?", options: ["Was ist Wetter?", "Wie ist das Wetter?", "Wann ist Wetter?", "Wo ist das Wetter?"], answer: 1 },
      { q: "«Es ist heiß» значит:", options: ["холодно", "прохладно", "тепло", "жарко"], answer: 3 },
      { q: "«Es schneit» значит:", options: ["Идёт дождь", "Идёт снег", "Туман", "Ветер"], answer: 1 },
    ],
  },
  {
    id: "travel",
    title: "Путешествия",
    emoji: "✈️",
    level: "A2",
    cards: [
      { title: "В отеле", body: "das Hotel — отель\ndas Zimmer — номер\ndie Rezeption — ресепшн\nIch habe ein Zimmer reserviert. — Я забронировал номер.\nFür wie viele Nächte? — На сколько ночей?\nder Schlüssel — ключ\ndas Frühstück — завтрак\nIst das Frühstück inklusive? — Завтрак включён?" },
      { title: "Путешествие", body: "der Reisepass — паспорт\ndas Visum — виза\nder Koffer — чемодан\ndie Unterkunft — жильё\ndie Sehenswürdigkeit — достопримечательность\nbesichtigen — осматривать\nder Stadtplan — карта города\nWo ist...? — Где находится...?" },
      { title: "Немецкие города", body: "Berlin — Берлин (столица, 3,7 млн)\nMünchen — Мюнхен (пиво, Альпы, BMW)\nHamburg — Гамбург (порт, второй по величине)\nKöln — Кёльн (собор, карнавал)\nFrankfurt — Франкфурт (банки, аэропорт)\nDresden — Дрезден (барокко, Саксония)\n\n💡 Berlin — самый популярный туристический город Германии!\nBrandenburger Tor — символ Берлина" },
    ],
    exam: [
      { q: "«Ich habe ein Zimmer reserviert» значит:", options: ["Я ищу номер", "Я забронировал номер", "Я хочу номер", "Мне нужен номер"], answer: 1 },
      { q: "«Das Frühstück ist inklusive» значит:", options: ["завтрак платный", "завтрак включён", "завтрак не предоставляется", "завтрак опциональный"], answer: 1 },
      { q: "«Die Sehenswürdigkeit» — это:", options: ["отель", "ресторан", "достопримечательность", "карта"], answer: 2 },
      { q: "«Der Reisepass» — это:", options: ["билет", "виза", "паспорт", "чемодан"], answer: 2 },
      { q: "«Besichtigen» значит:", options: ["бронировать", "путешествовать", "осматривать", "фотографировать"], answer: 2 },
    ],
  },
  {
    id: "adjectives",
    title: "Сравнение прилагательных",
    emoji: "📊",
    level: "A2",
    cards: [
      { title: "Сравнительная степень", body: "Добавляем -er:\nschnell → schneller (быстрее)\nklein → kleiner (меньше)\nalt → älter (старше) ← умлаут!\ngroß → größer (больше)\n\nA ist ... als B — A ... чем B:\nIch bin größer als du. — Я выше тебя.\nDer Zug ist schneller als der Bus.\nПоезд быстрее автобуса." },
      { title: "Превосходная степень", body: "am ...-sten / der/die/das ...-ste\n\nschnell → am schnellsten (быстрее всего)\ngroß → am größten (самый большой)\nalt → am ältesten (самый старый)\n\nНеправильные:\ngut → besser → am besten\nviel → mehr → am meisten\ngern → lieber → am liebsten\n\n💡 gut/viel/gern — учи отдельно!" },
      { title: "Неправильные степени", body: "gut — besser — am besten (хороший)\nviel — mehr — am meisten (много)\ngern — lieber — am liebsten (охотно)\n\nДополнительно:\nhoch — höher — am höchsten\nОчень высокий→выше→самый высокий\n\nnah — näher — am nächsten\nБлизко→ближе→самый ближний\n\n⚠️ hoch перед существительным теряет -ch: ein hohes Gebäude (не hochs!)\n\n💡 nächste также значит «следующий»: die nächste Straße — следующая улица" },
    ],
    exam: [
      { q: "Сравнительная степень от «schnell» — это:", options: ["schnellst", "schneller", "schnellste", "mehr schnell"], answer: 1 },
      { q: "«Ich bin größer als du» значит:", options: ["Я такой же высокий как ты", "Я ниже тебя", "Я выше тебя", "Ты выше меня"], answer: 2 },
      { q: "Превосходная степень от «gut» — это:", options: ["guter", "am gutsten", "am besten", "am gutensten"], answer: 2 },
      { q: "«Lieber» — это сравнительная степень от:", options: ["lieb", "gern", "viel", "gut"], answer: 1 },
      { q: "«Am ältesten» — это превосходная степень от:", options: ["alt", "älter", "alle", "alles"], answer: 0 },
    ],
  },
  {
    id: "subordinate",
    title: "Придаточные предложения",
    emoji: "🔗",
    level: "A2",
    cards: [
      { title: "Союзы weil, dass, wenn", body: "weil — потому что (глагол в конец!)\nIch lerne Deutsch, weil ich in Deutschland wohne.\nЯ учу немецкий, потому что живу в Германии.\n\ndass — что\nIch denke, dass das richtig ist.\nЯ думаю, что это правильно.\n\nwenn — когда / если\nWenn ich Zeit habe, lese ich.\nКогда у меня есть время, я читаю." },
      { title: "Порядок слов в придаточном", body: "В придаточном предложении глагол идёт В КОНЕЦ:\n\nweil ich müde BIN (не «bin ich»)\ndass er kommen WILL\nwenn sie Zeit HAT\n\n💡 Главное предложение + запятая + придаточное\n\nIch bleibe zu Hause, weil es regnet.\nЯ остаюсь дома, потому что идёт дождь." },
      { title: "Союзы ob и als", body: "ob — является ли / ли (косвенный вопрос)\nIch weiß nicht, ob er kommt. — Я не знаю, придёт ли он.\nSie fragt, ob ich Zeit habe. — Она спрашивает, есть ли у меня время.\n\nals — когда (в прошлом, однократно)\nAls ich jung war, spielte ich Fußball.\nКогда я был молодым, я играл в футбол.\n\n⚠️ als (прошлое) vs. wenn (настоящее/будущее/повторяющееся):\nWenn ich Zeit habe... (каждый раз когда)\nAls ich Kind war... (однажды в прошлом)" },
    ],
    exam: [
      { q: "«Ich lerne Deutsch, ___ ich in Deutschland wohne.» (потому что)", options: ["wenn", "dass", "weil", "aber"], answer: 2 },
      { q: "Где в придаточном предложении стоит глагол?", options: ["На первом месте", "На втором месте", "В конце", "После союза"], answer: 2 },
      { q: "«Wenn» означает:", options: ["потому что", "что", "когда/если", "хотя"], answer: 2 },
      { q: "«Ich denke, ___ du recht hast.»", options: ["weil", "wenn", "dass", "ob"], answer: 2 },
      { q: "Что нужно поставить между главным и придаточным предложением?", options: ["точку", "запятую", "двоеточие", "ничего"], answer: 1 },
    ],
  },

  // ── A3 СРЕДНИЙ ────────────────────────────────────────────────
  {
    id: "health_advanced",
    title: "Здоровье и тело",
    emoji: "🏥",
    level: "A3",
    cards: [
      { title: "Части тела", body: "der Kopf — голова\nder Hals — шея / горло\nder Arm — рука (от плеча)\ndie Hand — кисть руки\ndas Bein — нога\nder Fuß — ступня\nder Bauch — живот\nder Rücken — спина\ndas Ohr — ухо\ndas Auge — глаз\nder Mund — рот\ndie Nase — нос" },
      { title: "У меня болит...", body: "Ich habe Schmerzen. — У меня болит.\nMir ist schlecht. — Мне плохо.\nIch fühle mich krank. — Я чувствую себя больным.\n\nWo tut es weh? — Где болит?\nMein Kopf tut weh. — У меня болит голова.\nMein Bauch tut weh. — У меня болит живот.\n\n💡 tut weh / tun weh — болит / болят" },
      { title: "Врач и аптека", body: "der Arzt / die Ärztin — врач\ndas Krankenhaus — больница\ndie Apotheke — аптека\ndas Rezept — рецепт\ndie Tablette — таблетка\ndas Medikament — лекарство\ndie Erkältung — простуда\ndas Fieber — температура\nder Husten — кашель\n\n💡 Ich brauche ein Rezept. — Мне нужен рецепт." },
    ],
    exam: [
      { q: "Как сказать «У меня болит голова»?", options: ["Ich habe Kopf.", "Mein Kopf tut weh.", "Der Kopf ist krank.", "Ich bin Kopf schlecht."], answer: 1 },
      { q: "«Die Apotheke» — это:", options: ["больница", "поликлиника", "аптека", "кабинет врача"], answer: 2 },
      { q: "«Das Fieber» означает:", options: ["кашель", "насморк", "температура", "простуда"], answer: 2 },
      { q: "«Mir ist schlecht» значит:", options: ["Мне скучно", "Мне плохо", "Мне холодно", "Мне грустно"], answer: 1 },
      { q: "Как спросить «Где болит?»", options: ["Wo bist du krank?", "Was hast du?", "Wo tut es weh?", "Wie geht es weh?"], answer: 2 },
    ],
  },
  {
    id: "shopping_advanced",
    title: "Покупки и деньги",
    emoji: "🛒",
    level: "A3",
    cards: [
      { title: "В магазине", body: "der Supermarkt — супермаркет\ndas Geschäft — магазин\nder Markt — рынок\ndie Bäckerei — булочная\ndie Metzgerei — мясная лавка\n\nkaufen — покупать\nbezahlen — платить\nkosten — стоить\n\nWas kostet das? — Сколько это стоит?\nIch möchte das kaufen. — Я хочу это купить." },
      { title: "Цены и деньги", body: "der Euro — евро\nder Cent — цент\ndas Geld — деньги\nteuer — дорогой\nbillig / günstig — дешёвый / выгодный\n\nDas ist zu teuer. — Это слишком дорого.\nHaben Sie etwas Günstigeres? — Есть что-то подешевле?\n\n💡 Das macht 5 Euro. — Это стоит 5 евро.\nStimmt so! — Сдачи не надо!" },
      { title: "Одежда и размеры", body: "die Kleidung — одежда\ndas Hemd — рубашка\ndie Hose — брюки\ndas Kleid — платье\nder Mantel — пальто\ndie Jacke — куртка\nder Schuh — туфля / ботинок\n\nWelche Größe? — Какой размер?\nDarf ich das anprobieren? — Можно примерить?\n\n💡 Größe 38, 40, 42... — немецкие размеры одежды" },
    ],
    exam: [
      { q: "«Was kostet das?» означает:", options: ["Что это такое?", "Сколько это стоит?", "Где это купить?", "Как это называется?"], answer: 1 },
      { q: "«Die Bäckerei» — это:", options: ["мясная лавка", "рынок", "аптека", "булочная"], answer: 3 },
      { q: "Как сказать «Можно примерить?»", options: ["Darf ich das kaufen?", "Darf ich das anprobieren?", "Kann ich das sehen?", "Ich möchte das."], answer: 1 },
      { q: "«Günstig» означает:", options: ["дорогой", "новый", "выгодный / дешёвый", "красивый"], answer: 2 },
      { q: "«Stimmt so!» говорят, когда:", options: ["товар не нравится", "не хотят сдачи", "просят скидку", "уходят из магазина"], answer: 1 },
    ],
  },
  {
    id: "transport_advanced",
    title: "Транспорт и дорога",
    emoji: "🚆",
    level: "A3",
    cards: [
      { title: "Виды транспорта", body: "der Zug — поезд\ndie U-Bahn — метро\ndie S-Bahn — городская электричка\nder Bus — автобус\ndie Straßenbahn — трамвай\ndas Taxi — такси\ndas Fahrrad — велосипед\ndas Auto — машина\ndas Flugzeug — самолёт\n\n💡 mit dem Zug fahren — ехать на поезде\nzu Fuß gehen — идти пешком" },
      { title: "Вокзал и билеты", body: "der Bahnhof — вокзал\ndie Haltestelle — остановка\nder Fahrplan — расписание\ndie Fahrkarte / das Ticket — билет\ndie Abfahrt — отправление\ndie Ankunft — прибытие\nder Bahnsteig — платформа\n\nEine Fahrkarte nach Berlin, bitte.\nОдин билет до Берлина, пожалуйста.\n\nWann fährt der nächste Zug? — Когда следующий поезд?" },
      { title: "Как спросить дорогу", body: "Entschuldigung! — Извините!\nWo ist...? — Где находится...?\nWie komme ich zum Bahnhof? — Как добраться до вокзала?\n\nGehen Sie geradeaus. — Идите прямо.\nBiegen Sie links/rechts ab. — Сверните налево/направо.\nEs ist in der Nähe. — Это рядом.\nEs ist weit. — Это далеко.\n\n💡 die erste Straße links — первая улица слева" },
    ],
    exam: [
      { q: "«Die Abfahrt» означает:", options: ["прибытие", "остановка", "отправление", "расписание"], answer: 2 },
      { q: "Как попросить билет до Берлина?", options: ["Ich will Berlin.", "Eine Fahrkarte nach Berlin, bitte.", "Geben Sie mir Berlin.", "Ticket für Berlin fahren."], answer: 1 },
      { q: "«Gehen Sie geradeaus» значит:", options: ["Сверните налево", "Идите прямо", "Остановитесь здесь", "Вернитесь назад"], answer: 1 },
      { q: "«Die U-Bahn» — это:", options: ["трамвай", "автобус", "метро", "электричка"], answer: 2 },
      { q: "Как по-немецки «расписание»?", options: ["der Bahnsteig", "die Haltestelle", "der Fahrplan", "das Ticket"], answer: 2 },
    ],
  },

  // ── A4 ЭКСПЕРТ ────────────────────────────────────────────────
  {
    id: "work_jobs",
    title: "Работа и профессии",
    emoji: "💼",
    level: "A4",
    cards: [
      { title: "Профессии", body: "der Arzt / die Ärztin — врач\nder Lehrer / die Lehrerin — учитель\nder Ingenieur / die Ingenieurin — инженер\nder Koch / die Köchin — повар\nder Verkäufer / die Verkäuferin — продавец\nder Polizist / die Polizistin — полицейский\nder Student / die Studentin — студент\n\n💡 В немецком всегда два варианта: мужской и женский. Ich bin Ärztin. (без артикля!)" },
      { title: "На работе", body: "die Arbeit — работа\ndas Büro — офис\ndie Firma — фирма, компания\nder Chef / die Chefin — начальник\nder Kollege / die Kollegin — коллега\ndie Besprechung — совещание\ndas Gehalt — зарплата\ndie Stelle / der Job — должность, работа\n\nIch arbeite bei Siemens. — Я работаю в Siemens.\nIch suche eine Stelle. — Я ищу работу." },
      { title: "Рабочее время", body: "Wann fangen Sie an? — Когда вы начинаете?\nIch fange um 8 Uhr an. — Я начинаю в 8.\nIch mache um 17 Uhr Feierabend. — Я заканчиваю в 17.\n\ndie Pause — перерыв\ndie Überstunden — сверхурочные\nder Urlaub — отпуск\nkrank sein — болеть\n\n💡 Feierabend! — Рабочий день окончен! (буквально «праздничный вечер»)" },
    ],
    exam: [
      { q: "Как сказать «Я врач» (женщина говорит)?", options: ["Ich bin eine Ärztin.", "Ich bin die Ärztin.", "Ich bin Ärztin.", "Ich habe Ärztin."], answer: 2 },
      { q: "«Das Gehalt» — это:", options: ["должность", "зарплата", "офис", "отпуск"], answer: 1 },
      { q: "«Ich suche eine Stelle» значит:", options: ["Я занял место", "Я ищу работу", "Я нашёл работу", "Мне нужен офис"], answer: 1 },
      { q: "«Feierabend» означает:", options: ["праздник", "выходной", "конец рабочего дня", "перерыв"], answer: 2 },
      { q: "«Der Kollege» — это:", options: ["начальник", "клиент", "коллега", "сотрудник службы безопасности"], answer: 2 },
    ],
  },
  {
    id: "free_time",
    title: "Досуг и хобби",
    emoji: "🎭",
    level: "A4",
    cards: [
      { title: "Хобби и спорт", body: "das Hobby — хобби\nder Sport — спорт\nschwimmen — плавать\nFußball spielen — играть в футбол\nRadfahren — ездить на велосипеде\nwandern — ходить в походы\nlesen — читать\nMusik hören — слушать музыку\nKochen — готовить\n\nWas machst du in deiner Freizeit?\nЧем ты занимаешься в свободное время?" },
      { title: "Культура и развлечения", body: "das Kino — кино\ndas Theater — театр\ndas Konzert — концерт\ndas Museum — музей\ndie Ausstellung — выставка\n\nIch gehe ins Kino. — Я иду в кино.\nIch gehe ins Theater. — Я иду в театр.\n\n💡 ins = in das (в — для мест куда идём)\nim = in dem (в — для мест где находимся)\nIch bin im Kino. — Я в кино." },
      { title: "Приглашения", body: "Hast du Lust...? — Хочешь...? / Есть желание...?\nHast du Zeit? — У тебя есть время?\nIch lade dich ein. — Я тебя приглашаю.\nGerne! — С удовольствием!\nLeider nicht. — К сожалению, нет.\nVielleicht ein anderes Mal. — Может, в другой раз.\n\nHast du Lust, ins Kino zu gehen?\nХочешь пойти в кино?" },
    ],
    exam: [
      { q: "«Hast du Lust?» означает:", options: ["Ты устал?", "У тебя есть деньги?", "Хочешь / есть желание?", "Ты свободен?"], answer: 2 },
      { q: "«Ich gehe ins Kino» — «ins» это сокращение от:", options: ["in das", "in dem", "in den", "in der"], answer: 0 },
      { q: "Как сказать «С удовольствием»?", options: ["Leider nicht.", "Vielleicht.", "Gerne!", "Danke schön."], answer: 2 },
      { q: "«Die Ausstellung» — это:", options: ["концерт", "выставка", "спектакль", "экскурсия"], answer: 1 },
      { q: "«Wandern» означает:", options: ["плавать", "бегать", "ходить в походы", "ехать на велосипеде"], answer: 2 },
    ],
  },
  {
    id: "communication",
    title: "Телефон и общение",
    emoji: "📱",
    level: "A4",
    cards: [
      { title: "Телефонный разговор", body: "das Telefon / das Handy — телефон / мобильник\nanrufen — звонить\nAuf Wiederhören! — До свидания! (по телефону)\n\nHallo, hier ist Anna. — Привет, это Анна.\nKann ich bitte mit Herrn Müller sprechen?\nМожно поговорить с господином Мюллером?\nEinen Moment, bitte. — Одну минуту, пожалуйста.\nEr ist gerade nicht da. — Его сейчас нет.\n\n💡 Ich rufe später zurück. — Я перезвоню позже." },
      { title: "Сообщения и почта", body: "die E-Mail — электронная почта\ndie Nachricht — сообщение\nschreiben — писать\nschicken — отправлять\nbekommen / erhalten — получать\n\nIch schreibe eine E-Mail. — Я пишу письмо.\nHaben Sie meine Nachricht bekommen?\nВы получили моё сообщение?\n\n💡 die SMS — смс-сообщение\nder Brief — бумажное письмо" },
      { title: "Личные данные", body: "der Name — имя\nder Vorname — имя (личное)\nder Familienname — фамилия\ndie Adresse — адрес\ndie Postleitzahl (PLZ) — почтовый индекс\ndie Telefonnummer — номер телефона\ndie E-Mail-Adresse — адрес почты\ndas Geburtsdatum — дата рождения\ndie Staatsangehörigkeit — гражданство\n\n💡 Wie schreibt man das? — Как это пишется?" },
    ],
    exam: [
      { q: "«Auf Wiederhören!» говорят:", options: ["при встрече", "по телефону прощаясь", "когда опаздывают", "на совещании"], answer: 1 },
      { q: "«Hier ist Anna» в телефонном разговоре значит:", options: ["Здесь Анна", "Это говорит Анна", "Анна дома", "Позовите Анну"], answer: 1 },
      { q: "«Die Postleitzahl» — это:", options: ["номер телефона", "почтовый индекс", "домашний адрес", "номер паспорта"], answer: 1 },
      { q: "«Ich rufe später zurück» означает:", options: ["Я позвоню завтра", "Я перезвоню позже", "Перезвони мне", "Я занят"], answer: 1 },
      { q: "«Die Staatsangehörigkeit» — это:", options: ["адрес", "профессия", "гражданство", "дата рождения"], answer: 2 },
    ],
  },
];

function loadBlocks(key) {
  try {
    const saved = JSON.parse(localStorage.getItem(key) || "{}");
    const result = {};
    Object.keys(saved).forEach(k => { result[k] = new Set(Array.isArray(saved[k]) ? saved[k] : []); });
    return result;
  } catch { return {}; }
}

function CurriculumScreen({ onBack, completedTopics, onTopicDone, userId }) {
  const STORAGE_KEY = `duopar_blocks_${userId || "guest"}`;

  const [activeTopicId, setActiveTopicId] = useState(null);
  const [mode, setMode] = useState(null); // "detail" | "block" | "exam" | "level_exam"
  const [activeBlockIdx, setActiveBlockIdx] = useState(null);
  const [levelExamLevel, setLevelExamLevel] = useState(null);
  const [completedBlocks, setCompletedBlocks] = useState(() => loadBlocks(STORAGE_KEY));
  const [activeLevel, setActiveLevel] = useState("PH");

  useEffect(() => {
    if (userId) setCompletedBlocks(loadBlocks(`duopar_blocks_${userId}`));
  }, [userId]);

  function saveBlocks(updated) {
    const serializable = {};
    Object.keys(updated).forEach(k => {
      serializable[k] = updated[k] instanceof Set ? [...updated[k]] : [];
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(serializable));
  }

  function doneBlocks(topicId) { return completedBlocks[topicId] || new Set(); }

  function getTopicBlocks(topic) {
    return topic.cards.map(card => {
      const ws = [];
      const tipLines = [];
      card.body.split("\n").forEach(l => {
        const trimmed = l.trim();
        if (!trimmed) return;
        const isEmoji = trimmed.startsWith("💡") || trimmed.startsWith("⚠️") || trimmed.startsWith("•");
        if (!isEmoji && trimmed.includes(" — ")) {
          const parts = trimmed.split(" — ");
          if (parts.length >= 2) {
            const de = parts[0].trim(), rawRu = parts[1].trim();
            const exMatch = rawRu.match(/^(.*?)\s*\(([^)]+)\)\s*$/);
            const ru = exMatch ? exMatch[1].trim() : rawRu;
            const exampleTranslation = exMatch ? exMatch[2] : null;
            if (de && ru && isGermanText(de)) ws.push({ de, ru, exampleTranslation, section: card.title, audioText: de.trim().split(/\s+/)[0], audioUrl: card.audioUrl || null, ...(card.fixedOptions ? { fixedOptions: card.fixedOptions } : {}) });
          }
        } else if (!isEmoji) {
          tipLines.push(trimmed);
        }
      });
      return { name: card.title, words: ws, tip: card.tip || null };
    }).filter(b => b.words.length > 0);
  }

  if (activeTopicId && mode) {
    const topic = CURRICULUM.find(t => t.id === activeTopicId);
    if (!topic) { setActiveTopicId(null); setMode(null); return null; }
    const blocks = getTopicBlocks(topic);

    if (mode === "block" && activeBlockIdx !== null) {
      const block = blocks[activeBlockIdx];
      if (!block || !block.words || block.words.length === 0) { setMode("detail"); return null; }
      return <TopicBlockLearnScreen
        block={block}
        allWords={blocks.flatMap(b => b.words)}
        audioEnabled={topic.audioEnabled === true || topic.level === "PH"}
        onBack={() => setMode("detail")}
        onDone={() => {
          setCompletedBlocks(prev => {
            const s = new Set(prev[activeTopicId] || []);
            s.add(activeBlockIdx);
            const updated = { ...prev, [activeTopicId]: s };
            saveBlocks(updated);
            return updated;
          });
          setMode("detail");
        }}
      />;
    }

    if (mode === "exam") {
      return <TopicExamScreen topic={topic} topicId={activeTopicId} onBack={() => setMode("detail")} onPass={() => { onTopicDone(activeTopicId); setMode(null); setActiveTopicId(null); }} />;
    }

    if (mode === "level_exam") {
      const lvlTopics = CURRICULUM.filter(t => t.level === levelExamLevel);
      const fakeTopic = {
        title: `Итоговый экзамен ${levelExamLevel}`,
        cards: lvlTopics.flatMap(t => t.cards),
        exam: shuffle(lvlTopics.flatMap(t => t.exam)).slice(0, 8),
      };
      return <TopicExamScreen topic={fakeTopic} onBack={() => setMode(null)} onPass={() => setMode(null)} />;
    }

    if (mode === "detail") {
      const done = doneBlocks(activeTopicId);
      const allDone = blocks.length > 0 && done.size >= blocks.length;
      const nextBlock = blocks.findIndex((_, i) => !done.has(i));
      const isLinkedBonus = !!topic.linkedBonus;
      const gold = "#f59e0b";
      const backTarget = isLinkedBonus
        ? CURRICULUM.find(t => t.bonusTopicId === activeTopicId)
        : null;

      return (
        <div style={{ paddingTop: 60, textAlign: "center" }}>
          <button
            onClick={() => { if (backTarget) setActiveTopicId(backTarget.id); else { setMode(null); setActiveTopicId(null); } }}
            style={{ background: "none", border: "none", color: isLinkedBonus ? "rgba(245,158,11,0.5)" : "rgba(255,255,255,0.4)", fontSize: 13, cursor: "pointer", marginBottom: 40, padding: 0, display: "block" }}
          >← Назад</button>

          {isLinkedBonus && (
            <div style={{ fontSize: 11, fontWeight: 800, color: gold, letterSpacing: 2, textTransform: "uppercase", marginBottom: 10 }}>⭐ Бонус</div>
          )}
          <div style={{ fontSize: 56, marginBottom: 12 }}>{topic.emoji}</div>
          <div style={{ fontSize: 26, fontWeight: 800, color: isLinkedBonus ? "#fcd34d" : "#fff", marginBottom: 6 }}>{topic.title}</div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", marginBottom: 36 }}>{done.size} из {blocks.length} частей пройдено</div>

          <div style={{ display: "flex", gap: 6, marginBottom: 48 }}>
            {blocks.map((_, i) => (
              <div key={i} style={{ flex: 1, height: 8, borderRadius: 4, background: done.has(i) ? (isLinkedBonus ? gold : "#7C5CFC") : "rgba(255,255,255,0.1)", transition: "background 0.4s" }} />
            ))}
          </div>

          {!allDone && (
            <button onClick={() => { setActiveBlockIdx(nextBlock); setMode("block"); }} style={{ width: "100%", padding: "18px", borderRadius: 16, background: isLinkedBonus ? `linear-gradient(135deg, ${gold}, #fbbf24)` : "#7C5CFC", border: "none", color: isLinkedBonus ? "#1a1000" : "#fff", fontSize: 16, fontWeight: 700, cursor: "pointer", marginBottom: 10 }}>
              {done.size === 0 ? "▶ Начать" : "▶ Продолжить"}
            </button>
          )}

          {!isLinkedBonus && (() => {
            const bonusTopic = topic.bonusTopicId ? CURRICULUM.find(t => t.id === topic.bonusTopicId) : null;
            if (!bonusTopic) return null;
            return (
              <button onClick={() => { setActiveTopicId(bonusTopic.id); setMode("detail"); }} style={{ width: "100%", marginTop: 16, marginBottom: 4, padding: "14px 18px", borderRadius: 14, background: "linear-gradient(135deg, rgba(245,158,11,0.15), rgba(251,191,36,0.08))", border: "1px solid rgba(245,158,11,0.4)", cursor: "pointer", display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 20 }}>⭐</span>
                <div style={{ textAlign: "left" }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#fcd34d" }}>{bonusTopic.title}</div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 2 }}>Бонус · необязательно</div>
                </div>
                <span style={{ marginLeft: "auto", color: "rgba(245,158,11,0.5)", fontSize: 16 }}>→</span>
              </button>
            );
          })()}

          {topic.bonus && allDone && (
            <div style={{ marginTop: 8, padding: "16px", borderRadius: 16, background: "linear-gradient(135deg, rgba(245,158,11,0.2), rgba(251,191,36,0.1))", border: "1px solid rgba(245,158,11,0.4)", textAlign: "center" }}>
              <div style={{ fontSize: 28, marginBottom: 6 }}>⭐</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: "#fcd34d" }}>Бонус пройден!</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginTop: 4 }}>Отличная работа</div>
              {topic.id === "colors_bonus" && (
                <div style={{ marginTop: 14, borderTop: "1px solid rgba(245,158,11,0.2)", paddingTop: 12 }}>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", marginBottom: 10 }}>Послушай песню про цвета 🎵</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.6)", marginBottom: 8 }}>Orange Sector — Farben</div>
                  <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
                    <a href="https://open.spotify.com/track/47uoSjqgclu4zjv3TV6aBG?si=4e759cc2c35940e0" target="_blank" rel="noopener noreferrer" style={{ padding: "8px 14px", borderRadius: 10, background: "#1DB954", color: "#fff", fontSize: 12, fontWeight: 700, textDecoration: "none" }}>▶ Spotify</a>
                    <a href="https://music.yandex.ru/album/3906770/track/32092219" target="_blank" rel="noopener noreferrer" style={{ padding: "8px 14px", borderRadius: 10, background: "#FFCC00", color: "#000", fontSize: 12, fontWeight: 700, textDecoration: "none" }}>▶ Яндекс</a>
                  </div>
                </div>
              )}
            </div>
          )}
          {!topic.bonus && (allDone ? (
            <button onClick={() => setMode("exam")} style={{ width: "100%", padding: "16px", borderRadius: 16, background: "linear-gradient(135deg, #7C5CFC, #a78bfa)", border: "none", color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer" }}>
              ⚡ Сдать экзамен
            </button>
          ) : (
            <div style={{ width: "100%", padding: "16px", borderRadius: 16, background: "rgba(124,92,252,0.06)", border: "1px solid rgba(124,92,252,0.12)", color: "rgba(255,255,255,0.2)", fontSize: 14, fontWeight: 600, textAlign: "center", boxSizing: "border-box" }}>
              🔒 Экзамен — после всех частей
            </div>
          ))}

          {done.size > 0 && (
            <button onClick={() => { const updated = { ...completedBlocks, [activeTopicId]: new Set() }; setCompletedBlocks(updated); saveBlocks(updated); setActiveBlockIdx(0); setMode("block"); }} style={{ marginTop: 10, background: "none", border: "none", color: "rgba(255,255,255,0.25)", fontSize: 13, cursor: "pointer" }}>
              🔁 Начать сначала
            </button>
          )}
        </div>
      );
    }
  }

  const LEVELS = ["PH", "A1", "PR", "A2", "A3", "A4"];
  // Level is unlocked if all previous level non-bonus topics are completed
  function isLevelUnlocked(lvl) {
    const idx = LEVELS.indexOf(lvl);
    if (idx === 0) return true;
    const prevLvl = LEVELS[idx - 1];
    return CURRICULUM.filter(t => t.level === prevLvl && !t.linkedBonus && !t.bonus).every(t => completedTopics.includes(t.id));
  }
  function isLevelDone(lvl) {
    return CURRICULUM.filter(t => t.level === lvl && !t.linkedBonus && !t.bonus).every(t => completedTopics.includes(t.id));
  }

  const lvl = activeLevel;
  const topics = CURRICULUM.filter(t => t.level === lvl && !t.linkedBonus);
  const lvlColor = CURRICULUM_LEVELS[lvl].color;
  const allTopicsDone = topics.filter(t => !t.bonus).every(t => completedTopics.includes(t.id));

  return (
    <div style={{ paddingTop: 40 }}>
      <button onClick={onBack} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", fontSize: 13, cursor: "pointer", marginBottom: 20, padding: 0 }}>← Назад</button>

      {/* Level tabs — always clickable, scrollbar hidden via CSS class */}
      <div className="scrollbar-hide" style={{ display: "flex", gap: 8, marginBottom: 28, overflowX: "auto", paddingBottom: 2 }}>
        {LEVELS.map((l) => {
          const unlocked = isLevelUnlocked(l);
          const done = isLevelDone(l);
          const active = l === activeLevel;
          const color = CURRICULUM_LEVELS[l].color;
          return (
            <button key={l} onClick={() => setActiveLevel(l)} style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 20, border: active ? `1.5px solid ${color}` : "1.5px solid rgba(255,255,255,0.1)", background: active ? `${color}22` : "rgba(255,255,255,0.04)", cursor: "pointer" }}>
              {done
                ? <span style={{ width: 20, height: 20, borderRadius: "50%", border: `2px solid ${color}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color, flexShrink: 0 }}>✓</span>
                : <span style={{ fontSize: 13, color: active ? color : unlocked ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.3)", fontWeight: 700 }}>{CURRICULUM_LEVELS[l].short}</span>}
              {active && <span style={{ fontSize: 12, color, fontWeight: 700, whiteSpace: "nowrap" }}>{CURRICULUM_LEVELS[l].label.split(" · ")[1]}</span>}
              {!unlocked && <span style={{ fontSize: 11, marginLeft: 2 }}>🔒</span>}
            </button>
          );
        })}
      </div>

      <div style={{ fontSize: 12, color: lvlColor, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", marginBottom: 16 }}>{CURRICULUM_LEVELS[lvl].label}</div>

      {/* Locked level banner */}
      {!isLevelUnlocked(lvl) && (
        <div style={{ marginBottom: 16, padding: "14px 18px", borderRadius: 14, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 22 }}>🔒</span>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.7)" }}>Блок ещё заблокирован</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 3 }}>Завершите предыдущий блок, чтобы открыть уроки</div>
          </div>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {topics.map((topic, idx) => {
          const levelUnlocked = isLevelUnlocked(lvl);
          const examDone = completedTopics.includes(topic.id);
          const blocks = getTopicBlocks(topic);
          const done = doneBlocks(topic.id);
          const blocksTotal = blocks.length;
          const blocksDone = done.size;
          const inProgress = blocksDone > 0 && !examDone;
          return (
            <button key={topic.id} onClick={() => { if (levelUnlocked) { setActiveTopicId(topic.id); setMode("detail"); } }}
              style={{ opacity: levelUnlocked ? 1 : 0.45, cursor: levelUnlocked ? "pointer" : "default", background: examDone ? "rgba(16,185,129,0.08)" : topic.bonus && !examDone ? "linear-gradient(135deg, rgba(245,158,11,0.12), rgba(251,191,36,0.06))" : inProgress ? "rgba(124,92,252,0.08)" : "rgba(255,255,255,0.04)", border: `1px solid ${examDone ? "rgba(16,185,129,0.3)" : topic.bonus && !examDone ? "rgba(245,158,11,0.45)" : inProgress ? "rgba(124,92,252,0.3)" : "rgba(255,255,255,0.1)"}`, borderRadius: 18, padding: "16px 18px", textAlign: "left", width: "100%", boxShadow: topic.bonus && !examDone ? "0 0 12px rgba(245,158,11,0.15)" : "none" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: blocksTotal > 0 ? 10 : 0 }}>
                <div style={{ fontSize: 26 }}>{examDone ? "✅" : topic.emoji}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: topic.bonus && !examDone ? "#fcd34d" : "#fff" }}>
                    {idx + 1}. {topic.title}
                  </div>
                  <div style={{ fontSize: 11, color: examDone ? "#10b981" : inProgress ? "#a78bfa" : "rgba(255,255,255,0.3)", marginTop: 2 }}>
                    {examDone ? "Экзамен сдан ✓" : inProgress ? `${blocksDone} из ${blocksTotal} частей` : `${blocksTotal} ${blocksTotal === 1 ? "часть" : blocksTotal < 5 ? "части" : "частей"}`}
                  </div>
                </div>
                <div style={{ color: "rgba(255,255,255,0.2)", fontSize: 14 }}>→</div>
              </div>
              {blocksTotal > 0 && (
                <div style={{ display: "flex", gap: 4 }}>
                  {blocks.map((_, bi) => (
                    <div key={bi} style={{ flex: 1, height: 4, borderRadius: 2, background: done.has(bi) ? (examDone ? "#10b981" : lvlColor) : "rgba(255,255,255,0.1)" }} />
                  ))}
                </div>
              )}
            </button>
          );
        })}

        {/* Итоговый экзамен уровня */}
        <button onClick={() => { setLevelExamLevel(lvl); setMode("level_exam"); }}
          style={{ background: allTopicsDone ? "rgba(16,185,129,0.08)" : "rgba(255,255,255,0.03)", border: `2px dashed ${allTopicsDone ? "#10b981" : lvlColor}`, borderRadius: 18, padding: "16px 18px", textAlign: "left", cursor: "pointer", width: "100%", opacity: allTopicsDone ? 1 : 0.7 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ fontSize: 26 }}>{allTopicsDone ? "🏆" : "📝"}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: allTopicsDone ? "#10b981" : "#fff" }}>Итоговый экзамен {CURRICULUM_LEVELS[lvl].short}</div>
              <div style={{ fontSize: 11, color: allTopicsDone ? "#10b981" : lvlColor, marginTop: 2 }}>
                {allTopicsDone ? "Все темы пройдены — сдавай!" : "Все темы уровня в одном экзамене"}
              </div>
            </div>
            <div style={{ color: allTopicsDone ? "#10b981" : lvlColor, fontSize: 14 }}>→</div>
          </div>
        </button>
      </div>
    </div>
  );
}

function parseFlashcards(topic) {
  const cards = [];
  topic.cards.forEach(card => {
    const lines = card.body.split("\n").filter(l => l.includes(" — ") && !l.startsWith("💡") && !l.startsWith("⚠️") && !l.startsWith("•"));
    lines.forEach(line => {
      const parts = line.split(" — ");
      if (parts.length >= 2) {
        const raw = parts[1].trim();
        const noteMatch = raw.match(/\(([^)]+)\)/);
        const ru = raw.replace(/\s*\(.*?\)/g, "").trim();
        const note = noteMatch ? noteMatch[1] : null;
        if (de && ru) cards.push({ de, ru, note, section: card.title });
      }
    });
  });
  return cards.slice(0, 8);
}

const BATCH_SIZE = 4;

function TopicLearnScreen({ topic, onBack, onStartExam }) {
  const allCards = parseFlashcards(topic);
  // Group by section (card title) so each card = one named block
  const sectionMap = [];
  allCards.forEach(card => {
    const last = sectionMap[sectionMap.length - 1];
    if (last && last.name === card.section) last.words.push(card);
    else sectionMap.push({ name: card.section, words: [card] });
  });
  const batches = sectionMap.length > 0 ? sectionMap : [{ name: "Слова", words: allCards }];

  const [batchIdx, setBatchIdx] = useState(0);
  const [phase, setPhase] = useState("intro"); // "intro" | "practice"
  const [introIdx, setIntroIdx] = useState(0);
  const [practiceQueue, setPracticeQueue] = useState(() => shuffle(batches[0]?.words || []));
  const [practiceIdx, setPracticeIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [wrong, setWrong] = useState([]);

  const batch = batches[batchIdx] || { name: "", words: [] };
  const batchWords = batch.words;
  const isLastBatch = batchIdx === batches.length - 1;
  const totalSteps = batches.length * 2; // intro + practice per batch
  const currentStep = batchIdx * 2 + (phase === "practice" ? 1 : 0);

  function startPractice() {
    setPracticeQueue(shuffle(batchWords));
    setPracticeIdx(0);
    setSelected(null);
    setWrong([]);
    setPhase("practice");
  }

  function nextBatch() {
    const next = batchIdx + 1;
    setBatchIdx(next);
    setIntroIdx(0);
    setPhase("intro");
  }

  function pick(opt) {
    if (selected !== null) return;
    const card = practiceQueue[practiceIdx];
    setSelected(opt);
    const isCorrect = opt === card.ru;
    playSound(isCorrect ? "correct" : "wrong");
    setTimeout(() => {
      if (!isCorrect) setWrong(w => [...w, card]);
      const next = practiceIdx + 1;
      if (next < practiceQueue.length) { setPracticeIdx(next); setSelected(null); }
      else {
        const retry = [...wrong, ...(!isCorrect ? [card] : [])];
        if (retry.length > 0) { setPracticeQueue(shuffle(retry)); setPracticeIdx(0); setSelected(null); setWrong([]); }
        else if (isLastBatch) setPhase("pre_exam");
        else nextBatch();
      }
    }, 900);
  }

  // INTRO PHASE
  if (phase === "intro") {
    const card = batchWords[introIdx];
    const isLastCard = introIdx === batchWords.length - 1;
    return (
      <div style={{ paddingTop: 40 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
          <button onClick={onBack} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", fontSize: 13, cursor: "pointer", padding: 0, flexShrink: 0 }}>← Назад</button>
          <div style={{ flex: 1, height: 4, background: "rgba(255,255,255,0.08)", borderRadius: 2 }}>
            <div style={{ height: "100%", borderRadius: 2, background: "#a78bfa", width: `${((currentStep + (introIdx + 1) / batchWords.length) / totalSteps) * 100}%`, transition: "width 0.3s" }} />
          </div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", flexShrink: 0 }}>Блок {batchIdx + 1}/{batches.length}</div>
        </div>

        <div style={{ fontSize: 11, color: "#a78bfa", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 }}>📚 {batch.name}</div>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.25)", marginBottom: 20 }}>Слово {introIdx + 1} из {batchWords.length} · Запомни</div>

        {(() => { const COLOR_MAP = { rot: "#e53e3e", blau: "#3b82f6", grün: "#22c55e", gelb: "#eab308", orange: "#f97316", lila: "#a855f7", violett: "#8b5cf6", rosa: "#ec4899", schwarz: "#111", weiß: "#f8fafc", grau: "#6b7280", braun: "#92400e", gold: "#f59e0b", golden: "#f59e0b", silber: "#9ca3af", türkis: "#06b6d4", hellgrün: "#86efac", dunkelrot: "#7f1d1d", hellgrau: "#d1d5db", dunkelgrau: "#374151", dunkelblau: "#1e3a8a", hellblau: "#93c5fd", hellbraun: "#c4956a", dunkelgrün: "#166534", olivgrün: "#6b7c3f" }; const deKey = card.de.toLowerCase().replace(/^(der|die|das)\s+/, ""); const colorHex = COLOR_MAP[deKey]; return (
        <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 24, padding: "44px 28px", textAlign: "center", marginBottom: 16 }}>
          {colorHex && <div style={{ width: 52, height: 52, borderRadius: "50%", background: colorHex, margin: "0 auto 18px", border: colorHex === "#f8fafc" ? "2px solid rgba(255,255,255,0.3)" : "none", boxShadow: `0 0 18px ${colorHex}88` }} />}
          <div style={{ fontSize: card.de && card.de.length > 14 ? 28 : card.de && card.de.length > 10 ? 36 : 44, fontWeight: 900, color: "#fff", marginBottom: 22, wordBreak: "break-word", overflowWrap: "break-word" }}>{card.de}</div>
          <div style={{ width: 32, height: 2, background: "rgba(255,255,255,0.12)", margin: "0 auto 22px" }} />
          <div style={{ fontSize: 28, fontWeight: 700, color: "#a78bfa" }}>{card.ru ? card.ru.charAt(0).toUpperCase() + card.ru.slice(1) : card.ru}</div>
          {card.note && <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", marginTop: 10 }}>{card.note}</div>}
        </div>); })()}

        <div style={{ display: "flex", gap: 10 }}>
          {introIdx > 0 && <button onClick={() => setIntroIdx(i => i - 1)} style={{ flex: 1, padding: "14px", borderRadius: 14, background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.4)", border: "1px solid rgba(255,255,255,0.08)", fontSize: 14, cursor: "pointer" }}>←</button>}
          {!isLastCard
            ? <button onClick={() => setIntroIdx(i => i + 1)} style={{ flex: 3, padding: "14px", borderRadius: 14, background: "#7C5CFC", color: "#fff", border: "none", fontSize: 15, fontWeight: 700, cursor: "pointer" }}>Следующее →</button>
            : <button onClick={startPractice} style={{ flex: 3, padding: "14px", borderRadius: 14, background: "linear-gradient(135deg,#7C5CFC,#a78bfa)", color: "#fff", border: "none", fontSize: 15, fontWeight: 700, cursor: "pointer" }}>🎯 Проверить себя!</button>
          }
        </div>
      </div>
    );
  }

  // PRE-EXAM PHASE
  if (phase === "pre_exam") {
    return (
      <div style={{ paddingTop: 60, textAlign: "center", padding: "60px 24px 24px" }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>🎓</div>
        <div style={{ fontSize: 22, fontWeight: 800, color: "#fff", marginBottom: 8 }}>Слова выучены!</div>
        <div style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", marginBottom: 40 }}>Что хочешь сделать дальше?</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <button onClick={onStartExam} style={{ padding: "18px", borderRadius: 16, background: "linear-gradient(135deg, #7C5CFC, #a78bfa)", border: "none", color: "#fff", fontSize: 16, fontWeight: 700, cursor: "pointer" }}>⚡ Сдать экзамен</button>
          <button onClick={() => { setBatchIdx(0); setPhase("intro"); setIntroIdx(0); }} style={{ padding: "18px", borderRadius: 16, background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", color: "#fff", fontSize: 16, fontWeight: 600, cursor: "pointer" }}>🔁 Повторить слова</button>
          <button onClick={onBack} style={{ padding: "14px", borderRadius: 16, background: "none", border: "none", color: "rgba(255,255,255,0.35)", fontSize: 14, cursor: "pointer" }}>Выйти</button>
        </div>
      </div>
    );
  }

  // PRACTICE PHASE
  const card = practiceQueue[practiceIdx];
  const correct = card?.ru;
  const isSentence = w => w?.de ? /[.!?]$/.test(w.de.trim()) : false;
  // useMemo so shuffle doesn't re-run on every render (e.g. when selected changes)
  const options = useMemo(() => {
    if (!card) return [];
    const pool = (() => {
      const sameType = allCards.filter(f => f.ru !== correct && isSentence(f) === isSentence(card));
      return sameType.length >= 3 ? sameType : allCards.filter(f => f.ru !== correct);
    })();
    return shuffle([correct, ...shuffle(pool).slice(0, 3).map(f => f.ru)]);
  }, [practiceIdx, practiceQueue]);

  return (
    <div style={{ paddingTop: 40 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <button onClick={onBack} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", fontSize: 13, cursor: "pointer", padding: 0, flexShrink: 0 }}>← Назад</button>
        <div style={{ flex: 1, height: 4, background: "rgba(255,255,255,0.08)", borderRadius: 2 }}>
          <div style={{ height: "100%", borderRadius: 2, background: "#7C5CFC", width: `${((currentStep + (practiceIdx + 1) / practiceQueue.length) / totalSteps) * 100}%`, transition: "width 0.4s" }} />
        </div>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", flexShrink: 0 }}>Блок {batchIdx + 1}/{batches.length}</div>
      </div>

      <div style={{ fontSize: 11, color: "#7C5CFC", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 }}>🎯 {batch.name}</div>
      <div style={{ fontSize: 12, color: "rgba(255,255,255,0.25)", marginBottom: 20 }}>Угадай · {practiceIdx + 1} из {practiceQueue.length}</div>

      <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 20, padding: "36px 24px", textAlign: "center", marginBottom: 20 }}>
        <div style={{ fontSize: card.de && card.de.length > 14 ? 26 : card.de && card.de.length > 10 ? 32 : 38, fontWeight: 700, color: "#fff", wordBreak: "break-word", overflowWrap: "break-word" }}>{card.de}</div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {options.map((opt, i) => {
          let bg = "rgba(255,255,255,0.05)", border = "rgba(255,255,255,0.1)", color = "#fff";
          let icon = null;
          if (selected !== null) {
            if (opt === correct) { bg = "rgba(16,185,129,0.25)"; border = "#10b981"; color = "#10b981"; icon = "✓"; }
            else if (opt === selected) { bg = "rgba(239,68,68,0.25)"; border = "#ef4444"; color = "#ef4444"; icon = "✗"; }
            else color = "rgba(255,255,255,0.2)";
          }
          return <button key={i} onClick={() => pick(opt)} style={{ padding: "16px 18px", borderRadius: 14, background: bg, border: `1px solid ${border}`, color, fontSize: 15, textAlign: "left", cursor: selected !== null ? "default" : "pointer", fontWeight: 600, transition: "all 0.2s", display: "flex", justifyContent: "space-between", alignItems: "center" }}><span>{opt ? opt.charAt(0).toUpperCase() + opt.slice(1) : opt}</span>{icon && <span style={{ fontSize: 18, fontWeight: 800 }}>{icon}</span>}</button>;
        })}
      </div>
    </div>
  );
}

function TopicBlockLearnScreen({ block, allWords, onBack, onDone, audioEnabled }) {
  const words = block.words;
  const [phase, setPhase] = useState(block.tip ? "tip" : "intro");
  const [introIdx, setIntroIdx] = useState(0);

  const [practiceQueue, setPracticeQueue] = useState(() => shuffle(words));
  const [practiceIdx, setPracticeIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [multiSelected, setMultiSelected] = useState([]);
  const [multiConfirmed, setMultiConfirmed] = useState(false);
  const [wrong, setWrong] = useState([]);
  const [retryWords, setRetryWords] = useState([]);

  // All hooks must be at top level — before any conditional returns
  const isSentence = w => w?.de ? /[.!?]$/.test(w.de.trim()) : false;
  const optionPool = useMemo(() => {
    const seen = new Set();
    return [...words, ...allWords].filter(f => { if (seen.has(f.ru)) return false; seen.add(f.ru); return true; });
  }, [words, allWords]);
  const practiceCard = practiceQueue[practiceIdx];
  const reversed = practiceCard?.reversed ?? false;
  const correct = reversed ? practiceCard?.de : practiceCard?.ru;
  const options = useMemo(() => {
    if (!practiceCard) return [];
    if (practiceCard.fixedOptions) return shuffle(practiceCard.fixedOptions);
    if (reversed) {
      const wordCount = practiceCard.de.trim().split(/\s+/).length;
      const pool = optionPool.filter(f => f.de !== practiceCard.de && f.de.trim().split(/\s+/).length === wordCount);
      const fallbackPool = optionPool.filter(f => f.de !== practiceCard.de);
      const distractors = pool.length >= 3 ? pool : fallbackPool;
      return shuffle([practiceCard.de, ...shuffle(distractors).slice(0, 3).map(f => f.de)]);
    }
    const pool = (() => {
      const sameType = optionPool.filter(f => f.ru !== correct && isSentence(f) === isSentence(practiceCard));
      return sameType.length >= 3 ? sameType : optionPool.filter(f => f.ru !== correct);
    })();
    return shuffle([correct, ...shuffle(pool).slice(0, 3).map(f => f.ru)]);
  }, [practiceIdx, practiceQueue]);

  function startPractice() { setPracticeQueue(shuffle(words).map((w, i) => ({ ...w, reversed: i % 2 === 1 }))); setPracticeIdx(0); setSelected(null); setMultiSelected([]); setMultiConfirmed(false); setWrong([]); setPhase("practice"); }

  function advance(isCorrect) {
    if (!isCorrect) setWrong(w => [...w, practiceCard]);
    const next = practiceIdx + 1;
    if (next < practiceQueue.length) {
      setPracticeIdx(next);
      setSelected(null);
      setMultiSelected([]);
      setMultiConfirmed(false);
    } else {
      const retry = [...wrong, ...(!isCorrect ? [practiceCard] : [])];
      if (retry.length > 0) { setRetryWords(retry); setPhase("retry_intro"); }
      else onDone();
    }
  }

  function pick(opt) {
    if (selected !== null) return;
    setSelected(opt);
    const isCorrect = reversed ? opt === practiceCard.de : opt === practiceCard.ru;
    playSound(isCorrect ? "correct" : "wrong");
    setTimeout(() => advance(isCorrect), 900);
  }

  function toggleMulti(opt) {
    if (multiConfirmed) return;
    setMultiSelected(prev => prev.includes(opt) ? prev.filter(o => o !== opt) : [...prev, opt]);
  }

  function confirmMulti() {
    if (multiConfirmed || multiSelected.length === 0) return;
    setMultiConfirmed(true);
    const correctAnswers = Array.isArray(practiceCard.ru) ? practiceCard.ru : [practiceCard.ru];
    const isCorrect = correctAnswers.every(a => multiSelected.includes(a)) && multiSelected.every(a => correctAnswers.includes(a));
    playSound(isCorrect ? "correct" : "wrong");
    setTimeout(() => advance(isCorrect), 1200);
  }

  const progress = phase === "intro" ? introIdx / words.length / 2 : 0.5 + practiceIdx / practiceQueue.length / 2;

  if (phase === "tip") {
    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", padding: "20px 0 32px" }}>
        <button onClick={onBack} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", fontSize: 13, cursor: "pointer", padding: 0, textAlign: "left", marginBottom: 32 }}>← Назад</button>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center", gap: 0 }}>
          <div style={{ fontSize: 48, marginBottom: 20 }}>💡</div>
          <div style={{ fontSize: 13, color: "#a78bfa", fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 12 }}>{block.name}</div>
          <div style={{ fontSize: 18, color: "#fff", fontWeight: 700, lineHeight: 1.5, marginBottom: 10 }}>Правило</div>
          <div style={{ fontSize: 15, color: "rgba(255,255,255,0.7)", lineHeight: 1.75, maxWidth: 320, whiteSpace: "pre-wrap", textAlign: "left" }}>{block.tip}</div>
        </div>
        <button onClick={() => setPhase("intro")} style={{ width: "100%", padding: "17px", borderRadius: 16, background: "linear-gradient(135deg, #7C5CFC, #a78bfa)", border: "none", color: "#fff", fontSize: 16, fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 20px rgba(124,92,252,0.4)" }}>
          Понятно, начинаем →
        </button>
      </div>
    );
  }

  if (phase === "retry_intro") {
    return (
      <div style={{ paddingTop: 60, textAlign: "center", padding: "60px 24px 24px" }}>
        <div style={{ fontSize: 52, marginBottom: 16 }}>🔄</div>
        <div style={{ fontSize: 20, fontWeight: 800, color: "#fff", marginBottom: 8 }}>Работа над ошибками</div>
        <div style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", marginBottom: 8 }}>
          {retryWords.length} {retryWords.length === 1 ? "слово" : retryWords.length < 5 ? "слова" : "слов"} требуют повторения
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 32, marginTop: 24 }}>
          {retryWords.map((w, i) => (
            <div key={i} style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 12, padding: "12px 16px", display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#fff", fontWeight: 700 }}>{w.de}</span>
              <span style={{ color: "rgba(255,255,255,0.45)" }}>{w.ru}</span>
            </div>
          ))}
        </div>
        <button onClick={() => { setPracticeQueue(shuffle(retryWords)); setPracticeIdx(0); setSelected(null); setWrong([]); setPhase("practice"); }} style={{ width: "100%", padding: "16px", borderRadius: 16, background: "#7C5CFC", border: "none", color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer" }}>
          Повторить →
        </button>
      </div>
    );
  }

  if (phase === "intro") {
    const card = words[introIdx];
    const isLast = introIdx === words.length - 1;
    return (
      <div style={{ paddingTop: 40 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
          <button onClick={onBack} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", fontSize: 13, cursor: "pointer", padding: 0, flexShrink: 0 }}>← Назад</button>
          <div style={{ flex: 1, height: 4, background: "rgba(255,255,255,0.08)", borderRadius: 2 }}>
            <div style={{ height: "100%", borderRadius: 2, background: "#a78bfa", width: `${progress * 100}%`, transition: "width 0.3s" }} />
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
          <div style={{ fontSize: 11, color: "#a78bfa", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase" }}>📚 {block.name}</div>
        </div>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.25)", marginBottom: 20 }}>Карточка {introIdx + 1} из {words.length}</div>
        {(() => { const COLOR_MAP = { rot: "#e53e3e", blau: "#3b82f6", grün: "#22c55e", gelb: "#eab308", orange: "#f97316", lila: "#a855f7", violett: "#8b5cf6", rosa: "#ec4899", schwarz: "#111", weiß: "#f8fafc", grau: "#6b7280", braun: "#92400e", gold: "#f59e0b", golden: "#f59e0b", silber: "#9ca3af", türkis: "#06b6d4", hellgrün: "#86efac", dunkelrot: "#7f1d1d", hellgrau: "#d1d5db", dunkelgrau: "#374151", dunkelblau: "#1e3a8a", hellblau: "#93c5fd", hellbraun: "#c4956a", dunkelgrün: "#166534", olivgrün: "#6b7c3f" }; const deKey = card.de.toLowerCase().replace(/^(der|die|das)\s+/, ""); const colorHex = COLOR_MAP[deKey]; return (
        <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 24, padding: "36px 28px 28px", textAlign: "center", marginBottom: 16, position: "relative" }}>
          {colorHex && <div style={{ width: 52, height: 52, borderRadius: "50%", background: colorHex, margin: "0 auto 18px", border: colorHex === "#f8fafc" ? "2px solid rgba(255,255,255,0.3)" : "none", boxShadow: `0 0 18px ${colorHex}88` }} />}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 22 }}>
            <div style={{ fontSize: card.de && card.de.length > 14 ? 28 : card.de && card.de.length > 10 ? 36 : 44, fontWeight: 900, color: "#fff", wordBreak: "break-word", overflowWrap: "break-word" }}>{card.de}</div>
            {audioEnabled && <AudioButton text={card.audioText} audioUrl={card.audioUrl} size={32} />}
          </div>
          <div style={{ width: 32, height: 2, background: "rgba(255,255,255,0.12)", margin: "0 auto 22px" }} />
          {audioEnabled && card.ru && !/[а-яёА-ЯЁ]/.test(card.ru) ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", fontWeight: 600, textTransform: "uppercase", letterSpacing: 1 }}>Пример:</div>
                <div style={{ fontSize: 24, fontWeight: 700, color: "#a78bfa" }}>{card.ru.charAt(0).toUpperCase() + card.ru.slice(1)}</div>
                <AudioButton text={card.ru} size={26} />
              </div>
              {card.exampleTranslation && (
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.28)", fontStyle: "italic" }}>{card.exampleTranslation}</div>
              )}
            </div>
          ) : (
            <div style={{ fontSize: 28, fontWeight: 700, color: "#a78bfa" }}>{card.ru ? card.ru.charAt(0).toUpperCase() + card.ru.slice(1) : card.ru}</div>
          )}
          {card.note && <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", marginTop: 10 }}>{card.note}</div>}
        </div>); })()}
        <div style={{ display: "flex", gap: 10 }}>
          {introIdx > 0 && <button onClick={() => setIntroIdx(i => i - 1)} style={{ flex: 1, padding: "14px", borderRadius: 14, background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.4)", border: "1px solid rgba(255,255,255,0.08)", fontSize: 14, cursor: "pointer" }}>←</button>}
          {!isLast
            ? <button onClick={() => setIntroIdx(i => i + 1)} style={{ flex: 3, padding: "14px", borderRadius: 14, background: "#7C5CFC", color: "#fff", border: "none", fontSize: 15, fontWeight: 700, cursor: "pointer" }}>Следующее →</button>
            : <button onClick={startPractice} style={{ flex: 3, padding: "14px", borderRadius: 14, background: "linear-gradient(135deg,#7C5CFC,#a78bfa)", color: "#fff", border: "none", fontSize: 15, fontWeight: 700, cursor: "pointer" }}>🎯 Проверить себя!</button>}
        </div>
      </div>
    );
  }

  if (!practiceCard) return null;
  const card = practiceCard;
  return (
    <div style={{ paddingTop: 40 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <button onClick={onBack} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", fontSize: 13, cursor: "pointer", padding: 0, flexShrink: 0 }}>← Назад</button>
        <div style={{ flex: 1, height: 4, background: "rgba(255,255,255,0.08)", borderRadius: 2 }}>
          <div style={{ height: "100%", borderRadius: 2, background: "#7C5CFC", width: `${progress * 100}%`, transition: "width 0.4s" }} />
        </div>
      </div>
      <div style={{ fontSize: 11, color: "#7C5CFC", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 }}>🎯 {block.name}</div>
      <div style={{ fontSize: 12, color: "rgba(255,255,255,0.25)", marginBottom: 20 }}>{reversed ? "Как по-немецки?" : "Угадай перевод"} · {practiceIdx + 1} из {practiceQueue.length}</div>
      <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 20, padding: "36px 24px", textAlign: "center", marginBottom: 20 }}>
        {reversed
          ? <div style={{ fontSize: 28, fontWeight: 700, color: "#a78bfa" }}>{card.ru ? card.ru.charAt(0).toUpperCase() + card.ru.slice(1) : card.ru}</div>
          : <div style={{ fontSize: card.de && card.de.length > 14 ? 26 : card.de && card.de.length > 10 ? 32 : 38, fontWeight: 700, color: "#fff", wordBreak: "break-word", overflowWrap: "break-word" }}>{card.de}</div>
        }
      </div>
      {practiceCard.fixedOptions ? (
        <>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {options.map((opt, i) => {
              const isChosen = multiSelected.includes(opt);
              const correctAnswers = Array.isArray(practiceCard.ru) ? practiceCard.ru : [practiceCard.ru];
              const isCorrectOpt = correctAnswers.includes(opt);
              let bg = isChosen ? "rgba(124,92,252,0.2)" : "rgba(255,255,255,0.05)";
              let border = isChosen ? "#7C5CFC" : "rgba(255,255,255,0.1)";
              let color = "#fff";
              let icon = isChosen ? "☑" : null;
              if (multiConfirmed) {
                if (isCorrectOpt) { bg = "rgba(16,185,129,0.25)"; border = "#10b981"; color = "#10b981"; icon = "✓"; }
                else if (isChosen) { bg = "rgba(239,68,68,0.25)"; border = "#ef4444"; color = "#ef4444"; icon = "✗"; }
                else { color = "rgba(255,255,255,0.2)"; icon = null; }
              }
              return <button key={i} onClick={() => toggleMulti(opt)} style={{ padding: "16px 18px", borderRadius: 14, background: bg, border: `1px solid ${border}`, color, fontSize: 15, textAlign: "left", cursor: multiConfirmed ? "default" : "pointer", fontWeight: 600, transition: "all 0.2s", display: "flex", justifyContent: "space-between", alignItems: "center" }}><span>{opt ? opt.charAt(0).toUpperCase() + opt.slice(1) : opt}</span>{icon && <span style={{ fontSize: 18, fontWeight: 800 }}>{icon}</span>}</button>;
            })}
          </div>
          {!multiConfirmed && multiSelected.length > 0 && (
            <button onClick={confirmMulti} style={{ marginTop: 16, width: "100%", padding: "16px", borderRadius: 14, background: "linear-gradient(135deg,#7C5CFC,#a78bfa)", border: "none", color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer" }}>Проверить →</button>
          )}
        </>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {options.map((opt, i) => {
            let bg = "rgba(255,255,255,0.05)", border = "rgba(255,255,255,0.1)", color = "#fff";
            let icon = null;
            if (selected !== null) {
              if (opt === correct) { bg = "rgba(16,185,129,0.25)"; border = "#10b981"; color = "#10b981"; icon = "✓"; }
              else if (opt === selected) { bg = "rgba(239,68,68,0.25)"; border = "#ef4444"; color = "#ef4444"; icon = "✗"; }
              else color = "rgba(255,255,255,0.2)";
            }
            return <button key={i} onClick={() => pick(opt)} style={{ padding: "16px 18px", borderRadius: 14, background: bg, border: `1px solid ${border}`, color, fontSize: 15, textAlign: "left", cursor: selected !== null ? "default" : "pointer", fontWeight: 600, transition: "all 0.2s", display: "flex", justifyContent: "space-between", alignItems: "center" }}><span>{opt ? opt.charAt(0).toUpperCase() + opt.slice(1) : opt}</span>{icon && <span style={{ fontSize: 18, fontWeight: 800 }}>{icon}</span>}</button>;
          })}
        </div>
      )}
    </div>
  );
}

function buildExamQuestions(topic) {
  const flashcards = parseFlashcards(topic);
  // mix flashcard words + hardcoded exam questions, deduplicate
  const ARTICLES = new Set(["der","die","das","ein","eine","einen","einem","einer","des","dem","den"]);
  const wordQuestions = shuffle(flashcards).slice(0, 6).map(card => {
    const isArticle = ARTICLES.has(card.de.trim().toLowerCase());
    const q = isArticle
      ? `Какой род обозначает артикль «${card.de}»?`
      : `Как переводится «${card.de}»?`;
    return {
      q,
      options: shuffle([card.ru, ...shuffle(flashcards.filter(f => f.ru !== card.ru)).slice(0, 3).map(f => f.ru)]),
      answer: null,
      correctText: card.ru,
    };
  });
  const hardcoded = shuffle(topic.exam).slice(0, 4).map(q => ({ ...q, correctText: null }));
  return shuffle([...wordQuestions, ...hardcoded]).slice(0, 8);
}

function TopicExamScreen({ topic, topicId, onBack, onPass }) {
  const [questions] = useState(() => buildExamQuestions(topic));
  const [qi, setQi] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const total = questions.length;
  const passMark = Math.ceil(total * 0.7);
  const q = questions[qi];

  function isCorrect(opt, idx) {
    if (q.correctText !== null) return opt === q.correctText;
    return idx === q.answer;
  }

  function pick(opt, idx) {
    if (selected !== null) return;
    setSelected(opt);
    const correct = isCorrect(opt, idx);
    if (correct) { playSound("correct"); setScore(s => s + 1); }
    else playSound("wrong");
    setTimeout(() => {
      if (qi + 1 < total) { setQi(qi + 1); setSelected(null); }
      else setFinished(true);
    }, 900);
  }

  if (finished) {
    const passed = score >= passMark;
    const mission = topicId ? TOPIC_TOUR_MISSION[topicId] : null;
    return (
      <div style={{ paddingTop: 60, textAlign: "center" }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>{passed ? "🎉" : "😅"}</div>
        <div style={{ fontSize: 24, fontWeight: 800, color: "#fff", marginBottom: 8 }}>{passed ? "Тема пройдена!" : "Попробуй ещё раз"}</div>
        <div style={{ fontSize: 15, color: "rgba(255,255,255,0.5)", marginBottom: passed && mission ? 20 : 32 }}>{score} из {total} правильно · нужно {passMark}+</div>
        {passed && mission && (
          <div style={{ background: "linear-gradient(135deg, rgba(245,158,11,0.15), rgba(245,158,11,0.07))", border: "1px solid rgba(245,158,11,0.3)", borderRadius: 16, padding: "16px 18px", marginBottom: 24, textAlign: "left" }}>
            <div style={{ fontSize: 11, color: "#f59e0b", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>🗺️ Открылась миссия в туре</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#fff" }}>{mission.flag} {mission.land}</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>Теперь можешь применить знания в игре</div>
          </div>
        )}
        {passed
          ? <button onClick={onPass} style={{ width: "100%", padding: "16px", borderRadius: 16, background: "#10b981", color: "#fff", border: "none", fontSize: 16, fontWeight: 700, cursor: "pointer" }}>Продолжить →</button>
          : <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <button onClick={() => { setQi(0); setSelected(null); setScore(0); setFinished(false); }} style={{ width: "100%", padding: "16px", borderRadius: 16, background: "#7C5CFC", color: "#fff", border: "none", fontSize: 16, fontWeight: 700, cursor: "pointer" }}>Попробовать снова</button>
              <button onClick={onBack} style={{ width: "100%", padding: "14px", borderRadius: 16, background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.5)", border: "none", fontSize: 14, cursor: "pointer" }}>← Учить ещё раз</button>
            </div>
        }
      </div>
    );
  }

  return (
    <div style={{ paddingTop: 40 }}>
      <button onClick={onBack} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", fontSize: 13, cursor: "pointer", marginBottom: 20, padding: 0 }}>← Назад</button>
      <div style={{ fontSize: 12, color: "#f59e0b", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>⚡ Экзамен · {topic.title}</div>
      <div style={{ display: "flex", gap: 4, marginBottom: 24 }}>
        {questions.map((_, i) => <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i < qi ? "#10b981" : i === qi ? "#f59e0b" : "rgba(255,255,255,0.1)" }} />)}
      </div>
      <div style={{ fontSize: 20, fontWeight: 700, color: "#fff", lineHeight: 1.4, marginBottom: 28 }}>{q.q}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {q.options.map((opt, i) => {
          let bg = "rgba(255,255,255,0.05)";
          let border = "rgba(255,255,255,0.1)";
          let color = "rgba(255,255,255,0.85)";
          let icon = null;
          if (selected !== null) {
            if (isCorrect(opt, i)) { bg = "rgba(16,185,129,0.25)"; border = "#10b981"; color = "#10b981"; icon = "✓"; }
            else if (opt === selected) { bg = "rgba(239,68,68,0.25)"; border = "#ef4444"; color = "#ef4444"; icon = "✗"; }
            else color = "rgba(255,255,255,0.2)";
          }
          return (
            <button key={i} onClick={() => pick(opt, i)} style={{ padding: "16px 18px", borderRadius: 14, background: bg, border: `1px solid ${border}`, color, fontSize: 15, textAlign: "left", cursor: selected !== null ? "default" : "pointer", fontWeight: 500, transition: "all 0.2s", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>{opt}</span>{icon && <span style={{ fontSize: 18, fontWeight: 800 }}>{icon}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── СЛОВАРЬ GOETHE A1/A2 ─────────────────────────────────────
const WORD_LEVELS = ["A1", "A2"];
const WORD_CATEGORIES = ["Люди", "Дом", "Еда", "Город", "Время", "Глаголы", "Прилагательные", "Разное"];

const DICTIONARY = [
  // ЛЮДИ
  { word: "die Frau", level: "A1", category: "Люди", translation: "женщина / жена", gender: "die", plural: "die Frauen", example: "Die Frau arbeitet hier.", exampleRu: "Женщина работает здесь.", tip: "Frau — также вежливое обращение «госпожа»" },
  { word: "der Mann", level: "A1", category: "Люди", translation: "мужчина / муж", gender: "der", plural: "die Männer", example: "Der Mann kauft Brot.", exampleRu: "Мужчина покупает хлеб.", tip: "Mann с двойным n — не путай с man (безличное «один»)" },
  { word: "das Kind", level: "A1", category: "Люди", translation: "ребёнок", gender: "das", plural: "die Kinder", example: "Das Kind spielt im Garten.", exampleRu: "Ребёнок играет в саду.", tip: "Kinder — отсюда «Kindergarten» (детский сад)" },
  { word: "der Freund", level: "A1", category: "Люди", translation: "друг / парень", gender: "der", plural: "die Freunde", example: "Mein Freund wohnt in Berlin.", exampleRu: "Мой друг живёт в Берлине.", tip: "die Freundin — подруга / девушка" },
  { word: "die Familie", level: "A1", category: "Люди", translation: "семья", gender: "die", plural: "die Familien", example: "Meine Familie ist groß.", exampleRu: "Моя семья большая.", tip: "Похоже на русское «фамилия», но значит «семья»" },
  { word: "die Mutter", level: "A1", category: "Люди", translation: "мать", gender: "die", plural: "die Mütter", example: "Meine Mutter kocht gut.", exampleRu: "Моя мама хорошо готовит.", tip: "Mutti — ласковое «мамочка»" },
  { word: "der Vater", level: "A1", category: "Люди", translation: "отец", gender: "der", plural: "die Väter", example: "Mein Vater arbeitet viel.", exampleRu: "Мой папа много работает.", tip: "Vati — ласковое «папочка»" },
  { word: "der Bruder", level: "A1", category: "Люди", translation: "брат", gender: "der", plural: "die Brüder", example: "Mein Bruder ist 10 Jahre alt.", exampleRu: "Моему брату 10 лет.", tip: "Brüder — умлаут в множественном числе" },
  { word: "die Schwester", level: "A1", category: "Люди", translation: "сестра", gender: "die", plural: "die Schwestern", example: "Meine Schwester studiert Medizin.", exampleRu: "Моя сестра учится на врача.", tip: "Schwester — также «медсестра» в больнице" },
  { word: "der Kollege", level: "A2", category: "Люди", translation: "коллега (м)", gender: "der", plural: "die Kollegen", example: "Mein Kollege ist sehr nett.", exampleRu: "Мой коллега очень приятный.", tip: "die Kollegin — коллега-женщина" },

  // ДОМ
  { word: "das Haus", level: "A1", category: "Дом", translation: "дом", gender: "das", plural: "die Häuser", example: "Das Haus ist groß.", exampleRu: "Дом большой.", tip: "Häuser — умлаут + er в мн.ч." },
  { word: "die Wohnung", level: "A1", category: "Дом", translation: "квартира", gender: "die", plural: "die Wohnungen", example: "Ich suche eine Wohnung.", exampleRu: "Я ищу квартиру.", tip: "wohnen (жить) → Wohnung (жильё)" },
  { word: "das Zimmer", level: "A1", category: "Дом", translation: "комната", gender: "das", plural: "die Zimmer", example: "Das Zimmer ist hell.", exampleRu: "Комната светлая.", tip: "Мн.ч. такое же: die Zimmer" },
  { word: "die Küche", level: "A1", category: "Дом", translation: "кухня", gender: "die", plural: "die Küchen", example: "Wir essen in der Küche.", exampleRu: "Мы едим на кухне.", tip: "Küche — также «кухня» как стиль приготовления" },
  { word: "das Bett", level: "A1", category: "Дом", translation: "кровать", gender: "das", plural: "die Betten", example: "Das Bett ist sehr bequem.", exampleRu: "Кровать очень удобная.", tip: "ins Bett gehen — идти спать" },
  { word: "der Tisch", level: "A1", category: "Дом", translation: "стол", gender: "der", plural: "die Tische", example: "Das Buch liegt auf dem Tisch.", exampleRu: "Книга лежит на столе.", tip: "Tisch накрывают (Tisch decken) к обеду" },
  { word: "der Stuhl", level: "A1", category: "Дом", translation: "стул", gender: "der", plural: "die Stühle", example: "Setz dich auf den Stuhl!", exampleRu: "Садись на стул!", tip: "Не путай с Sessel (кресло)" },
  { word: "das Fenster", level: "A1", category: "Дом", translation: "окно", gender: "das", plural: "die Fenster", example: "Bitte mach das Fenster auf!", exampleRu: "Пожалуйста, открой окно!", tip: "Мн.ч. такое же: die Fenster" },
  { word: "die Tür", level: "A1", category: "Дом", translation: "дверь", gender: "die", plural: "die Türen", example: "Die Tür ist zu.", exampleRu: "Дверь закрыта.", tip: "zu = закрыто, auf = открыто" },
  { word: "der Schlüssel", level: "A1", category: "Дом", translation: "ключ", gender: "der", plural: "die Schlüssel", example: "Ich habe meinen Schlüssel vergessen.", exampleRu: "Я забыл свой ключ.", tip: "Мн.ч. такое же: die Schlüssel" },
  { word: "das Bad", level: "A1", category: "Дом", translation: "ванная", gender: "das", plural: "die Bäder", example: "Das Bad ist links.", exampleRu: "Ванная слева.", tip: "Baden = купаться; Bad = ванная или курорт" },
  { word: "der Kühlschrank", level: "A1", category: "Дом", translation: "холодильник", gender: "der", plural: "die Kühlschränke", example: "Der Kühlschrank ist leer.", exampleRu: "Холодильник пустой.", tip: "kühl (прохладный) + Schrank (шкаф)" },

  // ЕДА
  { word: "das Brot", level: "A1", category: "Еда", translation: "хлеб", gender: "das", plural: "die Brote", example: "Ich esse Brot zum Frühstück.", exampleRu: "Я ем хлеб на завтрак.", tip: "Немцы едят хлеб 2-3 раза в день — это основа!" },
  { word: "die Milch", level: "A1", category: "Еда", translation: "молоко", gender: "die", plural: "—", example: "Ich trinke Milch.", exampleRu: "Я пью молоко.", tip: "Обычно без множественного числа (несчётное)" },
  { word: "das Wasser", level: "A1", category: "Еда", translation: "вода", gender: "das", plural: "—", example: "Bitte ein Glas Wasser!", exampleRu: "Стакан воды, пожалуйста!", tip: "Mineralwasser — газированная, Leitungswasser — из крана" },
  { word: "der Kaffee", level: "A1", category: "Еда", translation: "кофе", gender: "der", plural: "—", example: "Ich trinke jeden Morgen Kaffee.", exampleRu: "Каждое утро я пью кофе.", tip: "В Германии очень популярен фильтр-кофе" },
  { word: "das Ei", level: "A1", category: "Еда", translation: "яйцо", gender: "das", plural: "die Eier", example: "Ich esse zwei Eier.", exampleRu: "Я ем два яйца.", tip: "Spiegelei — яичница, Rührei — scrambled eggs" },
  { word: "der Apfel", level: "A1", category: "Еда", translation: "яблоко", gender: "der", plural: "die Äpfel", example: "Ein Apfel pro Tag hält den Arzt fern.", exampleRu: "Яблоко в день — доктор не нужен.", tip: "Äpfel — умлаут в множественном числе" },
  { word: "das Fleisch", level: "A1", category: "Еда", translation: "мясо", gender: "das", plural: "—", example: "Er isst kein Fleisch.", exampleRu: "Он не ест мясо.", tip: "Fleischer — мясник (профессия)" },
  { word: "der Käse", level: "A1", category: "Еда", translation: "сыр", gender: "der", plural: "die Käse", example: "Ich mag Käse sehr.", exampleRu: "Я очень люблю сыр.", tip: "Немецкий сыр знаменит — Emmentaler, Gouda" },
  { word: "das Gemüse", level: "A1", category: "Еда", translation: "овощи", gender: "das", plural: "—", example: "Iss mehr Gemüse!", exampleRu: "Ешь больше овощей!", tip: "Обычно без мн.ч. — собирательное" },
  { word: "das Obst", level: "A1", category: "Еда", translation: "фрукты", gender: "das", plural: "—", example: "Obst ist gesund.", exampleRu: "Фрукты полезны.", tip: "Тоже собирательное, без мн.ч." },
  { word: "die Suppe", level: "A1", category: "Еда", translation: "суп", gender: "die", plural: "die Suppen", example: "Die Suppe ist heiß.", exampleRu: "Суп горячий.", tip: "Nudelsuppe — суп с лапшой" },
  { word: "der Kuchen", level: "A1", category: "Еда", translation: "пирог / торт", gender: "der", plural: "die Kuchen", example: "Zum Kaffee gibt es Kuchen.", exampleRu: "К кофе есть пирог.", tip: "Kaffee und Kuchen — немецкая традиция полдника" },

  // ГОРОД
  { word: "die Straße", level: "A1", category: "Город", translation: "улица", gender: "die", plural: "die Straßen", example: "Die Straße ist breit.", exampleRu: "Улица широкая.", tip: "В адресе сокращают: Str." },
  { word: "der Bahnhof", level: "A1", category: "Город", translation: "вокзал", gender: "der", plural: "die Bahnhöfe", example: "Der Zug fährt vom Bahnhof ab.", exampleRu: "Поезд отправляется с вокзала.", tip: "Bahn (поезд) + Hof (двор)" },
  { word: "die Haltestelle", level: "A1", category: "Город", translation: "остановка", gender: "die", plural: "die Haltestellen", example: "Die Haltestelle ist um die Ecke.", exampleRu: "Остановка за углом.", tip: "halten (останавливаться) + Stelle (место)" },
  { word: "das Krankenhaus", level: "A1", category: "Город", translation: "больница", gender: "das", plural: "die Krankenhäuser", example: "Er liegt im Krankenhaus.", exampleRu: "Он лежит в больнице.", tip: "krank (больной) + Haus (дом)" },
  { word: "die Schule", level: "A1", category: "Город", translation: "школа", gender: "die", plural: "die Schulen", example: "Die Kinder gehen in die Schule.", exampleRu: "Дети идут в школу.", tip: "in die Schule gehen — учиться в школе" },
  { word: "die Universität", level: "A2", category: "Город", translation: "университет", gender: "die", plural: "die Universitäten", example: "Sie studiert an der Universität.", exampleRu: "Она учится в университете.", tip: "Сокращение: die Uni" },
  { word: "das Geschäft", level: "A1", category: "Город", translation: "магазин / дело", gender: "das", plural: "die Geschäfte", example: "Das Geschäft öffnet um 9 Uhr.", exampleRu: "Магазин открывается в 9.", tip: "Также значит «бизнес, дело»" },
  { word: "der Supermarkt", level: "A1", category: "Город", translation: "супермаркет", gender: "der", plural: "die Supermärkte", example: "Ich kaufe im Supermarkt ein.", exampleRu: "Я делаю покупки в супермаркете.", tip: "einkaufen — делать покупки" },
  { word: "das Rathaus", level: "A2", category: "Город", translation: "ратуша", gender: "das", plural: "die Rathäuser", example: "Das Rathaus steht auf dem Marktplatz.", exampleRu: "Ратуша стоит на рыночной площади.", tip: "Rat (совет) + Haus (дом)" },
  { word: "die Post", level: "A1", category: "Город", translation: "почта", gender: "die", plural: "—", example: "Ich schicke einen Brief per Post.", exampleRu: "Я отправляю письмо по почте.", tip: "Auch: die Post = почтовое отделение" },

  // ВРЕМЯ
  { word: "die Uhr", level: "A1", category: "Время", translation: "часы / час", gender: "die", plural: "die Uhren", example: "Es ist 3 Uhr.", exampleRu: "Сейчас 3 часа.", tip: "Um 3 Uhr = в 3 часа" },
  { word: "der Tag", level: "A1", category: "Время", translation: "день", gender: "der", plural: "die Tage", example: "Guten Tag!", exampleRu: "Добрый день!", tip: "Guten Tag — официальное приветствие" },
  { word: "die Woche", level: "A1", category: "Время", translation: "неделя", gender: "die", plural: "die Wochen", example: "Ich arbeite fünf Tage pro Woche.", exampleRu: "Я работаю пять дней в неделю.", tip: "diese Woche — на этой неделе" },
  { word: "der Monat", level: "A1", category: "Время", translation: "месяц", gender: "der", plural: "die Monate", example: "Im Monat Januar ist es kalt.", exampleRu: "В январе холодно.", tip: "letzten Monat — в прошлом месяце" },
  { word: "das Jahr", level: "A1", category: "Время", translation: "год", gender: "das", plural: "die Jahre", example: "Das Jahr hat 12 Monate.", exampleRu: "В году 12 месяцев.", tip: "Ich bin 20 Jahre alt — мне 20 лет" },
  { word: "der Morgen", level: "A1", category: "Время", translation: "утро", gender: "der", plural: "die Morgen", example: "Guten Morgen!", exampleRu: "Доброе утро!", tip: "morgens — по утрам; morgen — завтра (другое слово!)" },
  { word: "der Abend", level: "A1", category: "Время", translation: "вечер", gender: "der", plural: "die Abende", example: "Guten Abend!", exampleRu: "Добрый вечер!", tip: "abends — по вечерам" },
  { word: "die Nacht", level: "A1", category: "Время", translation: "ночь", gender: "die", plural: "die Nächte", example: "Gute Nacht!", exampleRu: "Спокойной ночи!", tip: "nachts — ночью" },
  { word: "heute", level: "A1", category: "Время", translation: "сегодня", gender: "—", plural: "—", example: "Heute ist Montag.", exampleRu: "Сегодня понедельник.", tip: "Наречие, не изменяется" },
  { word: "morgen", level: "A1", category: "Время", translation: "завтра", gender: "—", plural: "—", example: "Morgen gehe ich zum Arzt.", exampleRu: "Завтра я иду к врачу.", tip: "Не путай с der Morgen (утро)!" },
  { word: "gestern", level: "A1", category: "Время", translation: "вчера", gender: "—", plural: "—", example: "Gestern war ich müde.", exampleRu: "Вчера я был уставшим.", tip: "vorgestern — позавчера" },

  // ГЛАГОЛЫ
  { word: "gehen", level: "A1", category: "Глаголы", translation: "идти / ехать", gender: "—", plural: "—", example: "Ich gehe in die Schule.", exampleRu: "Я иду в школу.", tip: "Perfekt с sein: ich bin gegangen" },
  { word: "kommen", level: "A1", category: "Глаголы", translation: "приходить", gender: "—", plural: "—", example: "Woher kommst du?", exampleRu: "Откуда ты?", tip: "Perfekt с sein: ich bin gekommen" },
  { word: "machen", level: "A1", category: "Глаголы", translation: "делать", gender: "—", plural: "—", example: "Was machst du heute?", exampleRu: "Что ты делаешь сегодня?", tip: "Perfekt с haben: ich habe gemacht" },
  { word: "arbeiten", level: "A1", category: "Глаголы", translation: "работать", gender: "—", plural: "—", example: "Ich arbeite in einem Büro.", exampleRu: "Я работаю в офисе.", tip: "du arbeitest (не забудь -e- перед -st)" },
  { word: "wohnen", level: "A1", category: "Глаголы", translation: "жить / проживать", gender: "—", plural: "—", example: "Ich wohne in München.", exampleRu: "Я живу в Мюнхене.", tip: "Wohnung (квартира) — от того же корня" },
  { word: "lernen", level: "A1", category: "Глаголы", translation: "учить / учиться", gender: "—", plural: "—", example: "Ich lerne Deutsch.", exampleRu: "Я учу немецкий.", tip: "lernen = учить (самому), lehren = учить (других)" },
  { word: "sprechen", level: "A1", category: "Глаголы", translation: "говорить", gender: "—", plural: "—", example: "Sprichst du Deutsch?", exampleRu: "Ты говоришь по-немецки?", tip: "du sprichst, er spricht — корневой умлаут!" },
  { word: "kaufen", level: "A1", category: "Глаголы", translation: "покупать", gender: "—", plural: "—", example: "Ich kaufe Brot im Supermarkt.", exampleRu: "Я покупаю хлеб в супермаркете.", tip: "verkaufen = продавать (ver- меняет смысл на обратный)" },
  { word: "schreiben", level: "A1", category: "Глаголы", translation: "писать", gender: "—", plural: "—", example: "Ich schreibe einen Brief.", exampleRu: "Я пишу письмо.", tip: "Perfekt: ich habe geschrieben" },
  { word: "lesen", level: "A1", category: "Глаголы", translation: "читать", gender: "—", plural: "—", example: "Ich lese ein Buch.", exampleRu: "Я читаю книгу.", tip: "du liest, er liest — корневое изменение!" },
  { word: "fahren", level: "A1", category: "Глаголы", translation: "ехать", gender: "—", plural: "—", example: "Ich fahre mit dem Auto.", exampleRu: "Я еду на машине.", tip: "Perfekt с sein: ich bin gefahren" },
  { word: "schlafen", level: "A1", category: "Глаголы", translation: "спать", gender: "—", plural: "—", example: "Ich schlafe 8 Stunden.", exampleRu: "Я сплю 8 часов.", tip: "du schläfst — умлаут в 2-м лице" },
  { word: "helfen", level: "A1", category: "Глаголы", translation: "помогать", gender: "—", plural: "—", example: "Kannst du mir helfen?", exampleRu: "Ты можешь мне помочь?", tip: "helfen + Dativ: ich helfe DIR (не dich!)" },
  { word: "brauchen", level: "A1", category: "Глаголы", translation: "нуждаться / нужно", gender: "—", plural: "—", example: "Ich brauche Hilfe.", exampleRu: "Мне нужна помощь.", tip: "Ich brauche = мне нужно" },
  { word: "verstehen", level: "A1", category: "Глаголы", translation: "понимать", gender: "—", plural: "—", example: "Ich verstehe das nicht.", exampleRu: "Я этого не понимаю.", tip: "Perfekt: ich habe verstanden" },
  { word: "fragen", level: "A1", category: "Глаголы", translation: "спрашивать", gender: "—", plural: "—", example: "Darf ich fragen?", exampleRu: "Можно спросить?", tip: "fragen + Akkusativ: ich frage ihn" },
  { word: "antworten", level: "A1", category: "Глаголы", translation: "отвечать", gender: "—", plural: "—", example: "Bitte antworte mir!", exampleRu: "Пожалуйста, ответь мне!", tip: "antworten + Dativ: ich antworte DIR" },
  { word: "heißen", level: "A1", category: "Глаголы", translation: "называться / звать", gender: "—", plural: "—", example: "Wie heißt du?", exampleRu: "Как тебя зовут?", tip: "Ich heiße Anna. — Меня зовут Анна." },

  // ПРИЛАГАТЕЛЬНЫЕ
  { word: "groß", level: "A1", category: "Прилагательные", translation: "большой / высокий", gender: "—", plural: "—", example: "Das Haus ist sehr groß.", exampleRu: "Дом очень большой.", tip: "Также значит «высокий» о человеке" },
  { word: "klein", level: "A1", category: "Прилагательные", translation: "маленький", gender: "—", plural: "—", example: "Das Kind ist noch klein.", exampleRu: "Ребёнок ещё маленький.", tip: "Антоним: groß" },
  { word: "gut", level: "A1", category: "Прилагательные", translation: "хороший / хорошо", gender: "—", plural: "—", example: "Das Essen ist sehr gut.", exampleRu: "Еда очень хорошая.", tip: "Сравн. ст.: besser — лучше, am besten — лучший" },
  { word: "neu", level: "A1", category: "Прилагательные", translation: "новый", gender: "—", plural: "—", example: "Ich habe ein neues Auto.", exampleRu: "У меня новая машина.", tip: "Antonym: alt (старый)" },
  { word: "alt", level: "A1", category: "Прилагательные", translation: "старый / пожилой", gender: "—", plural: "—", example: "Das Buch ist sehr alt.", exampleRu: "Книга очень старая.", tip: "Wie alt bist du? — Сколько тебе лет?" },
  { word: "schön", level: "A1", category: "Прилагательные", translation: "красивый / хороший", gender: "—", plural: "—", example: "Das Wetter ist schön.", exampleRu: "Погода хорошая.", tip: "Schönen Tag! — Хорошего дня!" },
  { word: "schnell", level: "A1", category: "Прилагательные", translation: "быстрый / быстро", gender: "—", plural: "—", example: "Das Auto fährt schnell.", exampleRu: "Машина едет быстро.", tip: "Антоним: langsam (медленный)" },
  { word: "billig", level: "A1", category: "Прилагательные", translation: "дешёвый", gender: "—", plural: "—", example: "Das ist sehr billig.", exampleRu: "Это очень дёшево.", tip: "Антоним: teuer (дорогой)" },
  { word: "teuer", level: "A2", category: "Прилагательные", translation: "дорогой", gender: "—", plural: "—", example: "Das ist zu teuer!", exampleRu: "Это слишком дорого!", tip: "Антоним: billig (дешёвый)" },
  { word: "richtig", level: "A2", category: "Прилагательные", translation: "правильный / настоящий", gender: "—", plural: "—", example: "Das ist richtig.", exampleRu: "Это правильно.", tip: "Антоним: falsch (неправильный)" },
  { word: "wichtig", level: "A2", category: "Прилагательные", translation: "важный", gender: "—", plural: "—", example: "Das ist sehr wichtig.", exampleRu: "Это очень важно.", tip: "Wicht — гном, важная персона (исторически)" },

  // РАЗНОЕ
  { word: "bitte", level: "A1", category: "Разное", translation: "пожалуйста", gender: "—", plural: "—", example: "Ein Kaffee, bitte!", exampleRu: "Кофе, пожалуйста!", tip: "Также значит «пожалуйста» в ответ на «спасибо»" },
  { word: "danke", level: "A1", category: "Разное", translation: "спасибо", gender: "—", plural: "—", example: "Danke schön!", exampleRu: "Большое спасибо!", tip: "Danke schön / Danke sehr — усиленное «спасибо»" },
  { word: "ja", level: "A1", category: "Разное", translation: "да", gender: "—", plural: "—", example: "Ja, ich verstehe.", exampleRu: "Да, я понимаю.", tip: "Ja, genau! — Да, точно!" },
  { word: "nein", level: "A1", category: "Разное", translation: "нет", gender: "—", plural: "—", example: "Nein, das stimmt nicht.", exampleRu: "Нет, это неверно.", tip: "Nicht = не (для глаголов), kein = ни одного (для сущ.)" },
  { word: "vielleicht", level: "A1", category: "Разное", translation: "может быть", gender: "—", plural: "—", example: "Vielleicht komme ich morgen.", exampleRu: "Может, я приду завтра.", tip: "viel + leicht = «легко» → возможно" },
  { word: "natürlich", level: "A1", category: "Разное", translation: "конечно", gender: "—", plural: "—", example: "Natürlich helfe ich dir!", exampleRu: "Конечно, я тебе помогу!", tip: "Часто используют вместо «ja» для выразительности" },
  { word: "wirklich", level: "A2", category: "Разное", translation: "действительно / правда", gender: "—", plural: "—", example: "Das ist wirklich schön.", exampleRu: "Это действительно красиво.", tip: "Wirklichkeit — реальность" },
  { word: "auch", level: "A1", category: "Разное", translation: "тоже / также", gender: "—", plural: "—", example: "Ich auch!", exampleRu: "Я тоже!", tip: "Ich auch = Me too — самое частое выражение" },
  { word: "noch", level: "A1", category: "Разное", translation: "ещё", gender: "—", plural: "—", example: "Ich bin noch müde.", exampleRu: "Я ещё устал.", tip: "noch nicht = ещё не; noch kein = ещё ни одного" },
  { word: "schon", level: "A1", category: "Разное", translation: "уже", gender: "—", plural: "—", example: "Ich bin schon fertig.", exampleRu: "Я уже готов.", tip: "Не путай: schon (уже) и schön (красивый)" },
];

const GENDER_COLOR = { der: "#3b82f6", die: "#ec4899", das: "#10b981", "—": "rgba(255,255,255,0.3)" };

function WordsScreen({ onBack, langLevel }) {
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("Все");
  const [filterLevel, setFilterLevel] = useState(langLevel || "A1");
  const [selected, setSelected] = useState(null);

  const filtered = DICTIONARY.filter(w =>
    (filterLevel === "Все" || w.level === filterLevel) &&
    (filterCat === "Все" || w.category === filterCat) &&
    (search === "" || w.word.toLowerCase().includes(search.toLowerCase()) || w.translation.toLowerCase().includes(search.toLowerCase()))
  );

  if (selected) {
    const w = selected;
    const gColor = GENDER_COLOR[w.gender] || GENDER_COLOR["—"];
    return (
      <div style={{ paddingTop: 40 }}>
        <button onClick={() => setSelected(null)} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", fontSize: 13, cursor: "pointer", marginBottom: 24, padding: 0 }}>
          ← Словарь
        </button>

        <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 24, padding: "28px 24px", marginBottom: 16 }}>
          <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
            <span style={{ fontSize: 11, background: `${gColor}20`, color: gColor, padding: "4px 10px", borderRadius: 20, fontWeight: 700 }}>{w.gender !== "—" ? w.gender : ""}</span>
            <span style={{ fontSize: 11, background: "rgba(124,92,252,0.15)", color: "#7C5CFC", padding: "4px 10px", borderRadius: 20, fontWeight: 600 }}>{w.level}</span>
            <span style={{ fontSize: 11, background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.4)", padding: "4px 10px", borderRadius: 20 }}>{w.category}</span>
          </div>
          <div style={{ fontSize: 34, fontWeight: 900, color: "#fff", marginBottom: 8 }}>{w.word}</div>
          <div style={{ fontSize: 18, color: "rgba(255,255,255,0.6)", marginBottom: 20 }}>{w.translation}</div>
          {w.plural && w.plural !== "—" && (
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", marginBottom: 4 }}>Мн.ч.: <span style={{ color: "rgba(255,255,255,0.6)" }}>{w.plural}</span></div>
          )}
        </div>

        <div style={{ background: "rgba(124,92,252,0.08)", border: "1px solid rgba(124,92,252,0.2)", borderRadius: 16, padding: "18px 20px", marginBottom: 12 }}>
          <div style={{ fontSize: 11, color: "#7C5CFC", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", marginBottom: 10 }}>Пример</div>
          <div style={{ fontSize: 16, color: "#fff", fontWeight: 600, marginBottom: 6 }}>{w.example}</div>
          <div style={{ fontSize: 14, color: "rgba(255,255,255,0.45)" }}>{w.exampleRu}</div>
        </div>

        <div style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: 16, padding: "16px 20px" }}>
          <div style={{ fontSize: 11, color: "#f59e0b", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>💡 Подсказка</div>
          <div style={{ fontSize: 14, color: "rgba(255,255,255,0.7)", lineHeight: 1.6 }}>{w.tip}</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ paddingTop: 40 }}>
      <button onClick={onBack} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", fontSize: 13, cursor: "pointer", marginBottom: 20, padding: 0 }}>
        ← Назад
      </button>
      <h1 style={{ fontSize: 26, fontWeight: 800, color: "#fff", margin: "0 0 4px" }}>Словарь</h1>
      <div style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", marginBottom: 20 }}>{filtered.length} слов · Goethe Institut</div>

      <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Поиск слова..." style={{ width: "100%", padding: "12px 16px", borderRadius: 12, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", fontSize: 15, outline: "none", boxSizing: "border-box", marginBottom: 14 }} />

      <div style={{ display: "flex", gap: 8, marginBottom: 14, overflowX: "auto", paddingBottom: 4 }}>
        {["A1", "A2", "Все"].map(l => (
          <button key={l} onClick={() => setFilterLevel(l)} style={{ flexShrink: 0, padding: "6px 14px", borderRadius: 20, border: "none", background: filterLevel === l ? "#7C5CFC" : "rgba(255,255,255,0.07)", color: filterLevel === l ? "#fff" : "rgba(255,255,255,0.45)", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>{l}</button>
        ))}
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 20, overflowX: "auto", paddingBottom: 4 }}>
        {["Все", ...WORD_CATEGORIES].map(c => (
          <button key={c} onClick={() => setFilterCat(c)} style={{ flexShrink: 0, padding: "6px 14px", borderRadius: 20, border: "none", background: filterCat === c ? "rgba(124,92,252,0.3)" : "rgba(255,255,255,0.05)", color: filterCat === c ? "#fff" : "rgba(255,255,255,0.4)", fontSize: 12, cursor: "pointer" }}>{c}</button>
        ))}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {filtered.map((w, i) => {
          const gColor = GENDER_COLOR[w.gender] || GENDER_COLOR["—"];
          return (
            <button key={i} onClick={() => setSelected(w)} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: "14px 16px", textAlign: "left", cursor: "pointer", display: "flex", alignItems: "center", gap: 12 }}>
              {w.gender !== "—" && (
                <div style={{ width: 36, height: 36, borderRadius: 10, background: `${gColor}20`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: gColor, flexShrink: 0 }}>
                  {w.gender}
                </div>
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>{w.word}</div>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>{w.translation}</div>
              </div>
              <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 16 }}>→</span>
            </button>
          );
        })}
        {filtered.length === 0 && (
          <div style={{ textAlign: "center", color: "rgba(255,255,255,0.25)", padding: "40px 0", fontSize: 14 }}>Ничего не найдено</div>
        )}
      </div>
    </div>
  );
}

// ── ТЕОРИЯ ───────────────────────────────────────────────────
const LESSONS = [
  {
    id: "articles",
    title: "Артикли",
    icon: "📌",
    color: "#7C5CFC",
    cards: [
      {
        title: "Три рода в немецком",
        body: "Каждое существительное имеет род:\n\n🔵 der — мужской\n🔴 die — женский\n🟢 das — средний\n\nРод нужно запоминать вместе со словом.",
      },
      {
        title: "Именительный падеж (Nominativ)",
        body: "Кто? Что? — подлежащее.\n\n🔵 der Hund\n🔴 die Katze\n🟢 das Kind\n\nПример:\n→ Der Hund schläft.\n→ Die Katze trinkt Milch.",
      },
      {
        title: "Винительный падеж (Akkusativ)",
        body: "Кого? Что? — прямое дополнение.\n\n🔵 den Hund ← меняется!\n🔴 die Katze\n🟢 das Kind\n\nПример:\n→ Ich sehe den Hund.\n→ Er kauft die Katze.",
      },
      {
        title: "Дательный падеж (Dativ)",
        body: "Кому? Чему? — косвенное дополнение.\n\n🔵 dem Hund\n🔴 der Katze ← меняется!\n🟢 dem Kind\n\nПример:\n→ Ich helfe dem Mann.\n→ Sie gibt der Frau Blumen.",
      },
      {
        title: "Таблица артиклей",
        type: "table",
        hint: "💡 В Akkusativ меняется только мужской род: der → den",
        headers: ["", "мужской", "женский", "средний"],
        rows: [
          ["Nominativ", "der", "die", "das"],
          ["Akkusativ", "den", "die", "das"],
          ["Dativ", "dem", "der", "dem"],
        ],
        highlights: [[1,1],[2,1],[3,2]],
      },
    ],
  },
  {
    id: "verbs",
    title: "Глаголы",
    icon: "⚡",
    color: "#10b981",
    cards: [
      {
        title: "Спряжение: sein (быть)",
        body: "ich bin       — я есть\ndu bist       — ты есть\ner/sie ist    — он/она есть\nwir sind      — мы есть\nihr seid      — вы есть\nsie/Sie sind  — они/Вы есть\n\nПример:\n→ Ich bin Student.\n→ Wir sind hier.",
        mono: true,
      },
      {
        title: "Спряжение: haben (иметь)",
        body: "ich habe      — я имею\ndu hast       — ты имеешь\ner/sie hat    — он/она имеет\nwir haben     — мы имеем\nihr habt      — вы имеете\nsie/Sie haben — они/Вы имеют\n\nПример:\n→ Ich habe ein Auto.\n→ Er hat Hunger.",
        mono: true,
      },
      {
        title: "Регулярные глаголы (-en)",
        body: "Основа + окончание:\n\nwohnen (жить)\nich wohn-e\ndu wohn-st\ner/sie wohn-t\nwir wohn-en\nihr wohn-t\nsie wohn-en\n\n💡 Большинство глаголов спрягаются по этой схеме.",
        mono: true,
      },
      {
        title: "Перфект: haben или sein?",
        body: "Прошедшее время = haben/sein + Partizip II\n\n✅ haben — большинство глаголов:\n→ Ich habe gegessen.\n→ Er hat geschlafen.\n\n✅ sein — движение и изменение состояния:\n→ Ich bin gegangen.\n→ Sie ist aufgestanden.\n\n💡 gehen, kommen, fahren, fliegen → sein",
      },
      {
        title: "Модальные глаголы",
        body: "können  — мочь (умею)\nmüssen  — должен\nwollen  — хотеть\nsollen  — должен (по чьей-то воле)\ndürfen  — можно (разрешено)\nmöchten — хотел бы\n\nСтруктура:\n→ Ich kann Deutsch sprechen.\n→ Er muss arbeiten.\n💡 Второй глагол — инфинитив в конце.",
      },
    ],
  },
  {
    id: "wordorder",
    title: "Порядок слов",
    icon: "🔤",
    color: "#f59e0b",
    cards: [
      {
        title: "Глагол всегда на 2-м месте",
        body: "В немецком глагол занимает СТРОГО 2-ю позицию.\n\n→ Ich gehe heute ins Kino.\n→ Heute gehe ich ins Kino.\n→ Ins Kino gehe ich heute.\n\n💡 Что бы ни стояло первым — глагол всегда второй.",
      },
      {
        title: "Отрицание: nicht и kein",
        body: "kein — отрицает существительное:\n→ Ich habe kein Auto.\n→ Das ist kein Problem.\n\nnicht — отрицает всё остальное:\n→ Ich gehe nicht.\n→ Er schläft nicht gut.\n\n💡 kein = k + ein (как артикль)",
      },
      {
        title: "Вопросительные слова",
        body: "Wer?    — Кто?\nWas?    — Что?\nWo?     — Где?\nWann?   — Когда?\nWie?    — Как?\nWarum?  — Почему?\nWohin?  — Куда?\nWoher?  — Откуда?\n\n→ Wo wohnst du?\n→ Wann kommst du?",
        mono: true,
      },
      {
        title: "Придаточные предложения",
        body: "В придаточном глагол уходит В КОНЕЦ.\n\nГлавное: Ich weiß.\nПридаточное: dass er kommt.\n→ Ich weiß, dass er kommt.\n\nДругие союзы:\nweil (потому что)\nobwohl (хотя)\nwenn (если/когда)\n→ Er lernt, weil er klug ist.",
      },
    ],
  },
  {
    id: "vocab",
    title: "Лексика",
    icon: "💡",
    color: "#ec4899",
    cards: [
      {
        title: "Сложные слова (Komposita)",
        body: "Немецкий создаёт новые слова соединяя старые:\n\ndie Hand + das Tuch = das Handtuch (полотенце)\ndie Wasser + die Flasche = die Wasserflasche (бутылка воды)\nder Zahn + die Bürste = die Zahnbürste (зубная щётка)\n\n💡 Род определяется последним словом!",
      },
      {
        title: "Числа 1–20",
        body: "1 eins    11 elf\n2 zwei    12 zwölf\n3 drei    13 dreizehn\n4 vier    14 vierzehn\n5 fünf    15 fünfzehn\n6 sechs   16 sechzehn\n7 sieben  17 siebzehn\n8 acht    18 achtzehn\n9 neun    19 neunzehn\n10 zehn   20 zwanzig",
        mono: true,
      },
      {
        title: "Дни недели",
        body: "Montag     — Понедельник\nDienstag   — Вторник\nMittwoch   — Среда\nDonnerstag — Четверг\nFreitag    — Пятница\nSamstag    — Суббота\nSonntag    — Воскресенье\n\n💡 Все мужского рода: der Montag",
        mono: true,
      },
      {
        title: "Полезные фразы",
        body: "Wie bitte?         — Простите?\nIch verstehe nicht. — Я не понимаю.\nKönnen Sie langsamer sprechen? — Говорите медленнее?\nWas bedeutet...?   — Что значит...?\nIch lerne Deutsch.  — Я учу немецкий.\nMein Deutsch ist nicht so gut. — Мой немецкий не очень.",
      },
    ],
  },
];

function LearnScreen({ onBack }) {
  const [topic, setTopic] = useState(null);
  const [cardIdx, setCardIdx] = useState(0);

  if (topic) {
    const lesson = LESSONS.find(l => l.id === topic);
    const card = lesson.cards[cardIdx];
    const isLast = cardIdx === lesson.cards.length - 1;

    return (
      <div style={{ paddingTop: 40 }}>
        <button onClick={() => { setTopic(null); setCardIdx(0); }} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", fontSize: 13, cursor: "pointer", marginBottom: 24, padding: 0 }}>
          ← {lesson.title}
        </button>

        <div style={{ display: "flex", gap: 6, marginBottom: 28 }}>
          {lesson.cards.map((_, i) => (
            <div key={i} onClick={() => setCardIdx(i)} style={{ flex: 1, height: 4, borderRadius: 2, background: i <= cardIdx ? lesson.color : "rgba(255,255,255,0.12)", cursor: "pointer", transition: "background 0.3s" }} />
          ))}
        </div>

        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", marginBottom: 12 }}>
          {cardIdx + 1} / {lesson.cards.length}
        </div>

        <div style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${lesson.color}30`, borderRadius: 20, padding: "28px 24px", marginBottom: 24, minHeight: 280 }}>
          <div style={{ fontSize: 11, letterSpacing: 2, color: lesson.color, fontWeight: 700, textTransform: "uppercase", marginBottom: 16 }}>{lesson.icon} {lesson.title}</div>
          <div style={{ fontSize: 19, fontWeight: 800, color: "#fff", marginBottom: 20, lineHeight: 1.3 }}>{card.title}</div>
          {card.type === "table" ? (
            <div>
              <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 16 }}>
                <thead>
                  <tr>
                    {card.headers.map((h, i) => (
                      <th key={i} style={{ padding: "10px 8px", fontSize: 12, fontWeight: 700, color: i === 0 ? "rgba(255,255,255,0.4)" : lesson.color, textAlign: i === 0 ? "left" : "center", borderBottom: "1px solid rgba(255,255,255,0.1)", textTransform: i === 0 ? "none" : "uppercase", letterSpacing: i === 0 ? 0 : 1 }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {card.rows.map((row, ri) => (
                    <tr key={ri}>
                      {row.map((cell, ci) => {
                        const isHighlight = card.highlights?.some(([r, c]) => r === ri + 1 && c === ci);
                        return (
                          <td key={ci} style={{ padding: "12px 8px", fontSize: ci === 0 ? 12 : 18, fontWeight: ci === 0 ? 500 : 800, color: isHighlight ? "#ef4444" : ci === 0 ? "rgba(255,255,255,0.45)" : "#fff", textAlign: ci === 0 ? "left" : "center", borderBottom: ri < card.rows.length - 1 ? "1px solid rgba(255,255,255,0.06)" : "none", background: isHighlight ? "rgba(239,68,68,0.08)" : "transparent", borderRadius: 8 }}>
                            {cell}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
              {card.hint && <div style={{ fontSize: 13, color: "#f59e0b", background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: 10, padding: "10px 14px" }}>{card.hint}</div>}
            </div>
          ) : (
            <div style={{ fontSize: 14, color: "rgba(255,255,255,0.7)", lineHeight: 1.8, whiteSpace: "pre-line", fontFamily: card.mono ? "monospace" : "inherit" }}>
              {card.body}
            </div>
          )}
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={() => setCardIdx(i => Math.max(0, i - 1))} disabled={cardIdx === 0} style={{ flex: 1, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 14, padding: "14px", color: cardIdx === 0 ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.6)", fontSize: 15, cursor: cardIdx === 0 ? "default" : "pointer" }}>
            ← Назад
          </button>
          {isLast ? (
            <button onClick={() => { setTopic(null); setCardIdx(0); }} style={{ flex: 2, background: lesson.color, border: "none", borderRadius: 14, padding: "14px", color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer" }}>
              Готово ✓
            </button>
          ) : (
            <button onClick={() => setCardIdx(i => i + 1)} style={{ flex: 2, background: lesson.color, border: "none", borderRadius: 14, padding: "14px", color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer" }}>
              Далее →
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={{ paddingTop: 60 }}>
      <button onClick={onBack} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", fontSize: 13, cursor: "pointer", marginBottom: 24, padding: 0 }}>
        ← Назад
      </button>
      <div style={{ fontSize: 11, letterSpacing: 3, color: "#7C5CFC", fontWeight: 600, marginBottom: 12, textTransform: "uppercase" }}>DuoPar · Теория</div>
      <h1 style={{ fontSize: 28, fontWeight: 800, color: "#fff", margin: "0 0 6px" }}>Учить</h1>
      <div style={{ fontSize: 14, color: "rgba(255,255,255,0.35)", marginBottom: 28 }}>Карточки с правилами немецкого</div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {LESSONS.map(lesson => (
          <button key={lesson.id} onClick={() => setTopic(lesson.id)} style={{ background: "rgba(255,255,255,0.04)", border: `1.5px solid ${lesson.color}30`, borderRadius: 18, padding: "20px", textAlign: "left", cursor: "pointer", transition: "all 0.2s" }}
            onMouseEnter={e => { e.currentTarget.style.background = `${lesson.color}12`; e.currentTarget.style.borderColor = `${lesson.color}60`; }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.borderColor = `${lesson.color}30`; }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: `${lesson.color}20`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>
                {lesson.icon}
              </div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: "#fff", marginBottom: 4 }}>{lesson.title}</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}>{lesson.cards.length} карточек</div>
              </div>
              <span style={{ marginLeft: "auto", color: lesson.color, fontSize: 18 }}>→</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ── LEVEL PICKER ─────────────────────────────────────────────
function LevelPicker({ onPick, onTest }) {
  const levels = [
    { id: "A0", icon: "🌱", title: "A0 · Начинающий", desc: "Никогда не учил немецкий" },
    { id: "A1", icon: "📖", title: "A1 · Базовый", desc: "Знаю базовые слова и фразы" },
    { id: "A2", icon: "💬", title: "A2 · Элементарный", desc: "Понимаю простые предложения" },
  ];
  return (
    <div style={{ paddingTop: 60 }}>
      <div style={{ fontSize: 11, letterSpacing: 3, color: "#7C5CFC", fontWeight: 600, marginBottom: 12, textTransform: "uppercase" }}>DuoPar · Deutsch</div>
      <h1 style={{ fontSize: 26, fontWeight: 800, color: "#fff", margin: "0 0 6px" }}>Какой у тебя уровень?</h1>
      <div style={{ fontSize: 14, color: "rgba(255,255,255,0.35)", marginBottom: 28 }}>Выбери сам или пройди тест</div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
        {levels.map(l => (
          <button key={l.id} onClick={() => onPick(l.id)} style={{
            background: "rgba(255,255,255,0.04)", border: "1.5px solid rgba(255,255,255,0.1)",
            borderRadius: 16, padding: "18px 20px", cursor: "pointer", textAlign: "left",
            display: "flex", alignItems: "center", gap: 16, transition: "all 0.2s",
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "#7C5CFC"; e.currentTarget.style.background = "rgba(124,92,252,0.1)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}
          >
            <span style={{ fontSize: 28 }}>{l.icon}</span>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>{l.title}</div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>{l.desc}</div>
            </div>
            <span style={{ marginLeft: "auto", color: "rgba(255,255,255,0.25)", fontSize: 18 }}>→</span>
          </button>
        ))}
      </div>

      <button onClick={onTest} style={{
        width: "100%", background: "transparent", border: "1.5px dashed rgba(255,255,255,0.15)",
        borderRadius: 16, padding: "16px", cursor: "pointer", color: "rgba(255,255,255,0.45)",
        fontSize: 14, fontWeight: 500,
      }}>
        🤔 Не знаю свой уровень — пройти тест
      </button>
    </div>
  );
}

// ── PLACEMENT TEST ────────────────────────────────────────────
function PlacementTest({ onDone }) {
  const [qIndex, setQIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState(null);
  const [revealed, setRevealed] = useState(false);

  const q = PLACEMENT_TEST[qIndex];
  const isLast = qIndex === PLACEMENT_TEST.length - 1;

  function answer(i) {
    if (revealed) return;
    setSelected(i);
    setRevealed(true);
    const correct = i === q.correct;
    setScore(s => {
      const newScore = s + (correct ? 1 : 0);
      setTimeout(() => {
        if (isLast) { onDone(LEVEL_FROM_SCORE(newScore), newScore); }
        else { setQIndex(idx => idx + 1); setSelected(null); setRevealed(false); }
      }, 900);
      return newScore;
    });
  }

  function optStyle(i) {
    const base = { width: "100%", padding: "14px 18px", borderRadius: 14, border: "1.5px solid", fontSize: 15, fontWeight: 500, cursor: revealed ? "default" : "pointer", textAlign: "left", transition: "all 0.2s" };
    if (!revealed) return { ...base, background: selected === i ? "rgba(124,92,252,0.2)" : "rgba(255,255,255,0.04)", borderColor: selected === i ? "#7C5CFC" : "rgba(255,255,255,0.1)", color: "#fff" };
    if (i === q.correct) return { ...base, background: "rgba(16,185,129,0.15)", borderColor: "#10b981", color: "#10b981" };
    if (i === selected) return { ...base, background: "rgba(239,68,68,0.12)", borderColor: "#ef4444", color: "#ef4444" };
    return { ...base, background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.3)" };
  }

  return (
    <div style={{ paddingTop: 60 }}>
      <div style={{ fontSize: 11, letterSpacing: 3, color: "#7C5CFC", fontWeight: 600, marginBottom: 12, textTransform: "uppercase" }}>DuoPar · Тест уровня</div>
      <h1 style={{ fontSize: 26, fontWeight: 800, color: "#fff", margin: "0 0 6px" }}>Определим твой уровень</h1>
      <div style={{ fontSize: 14, color: "rgba(255,255,255,0.35)", marginBottom: 28 }}>10 вопросов · займёт ~2 минуты</div>

      <div style={{ display: "flex", gap: 6, marginBottom: 28 }}>
        {PLACEMENT_TEST.map((_, i) => (
          <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: i < qIndex ? "#7C5CFC" : i === qIndex ? "rgba(124,92,252,0.5)" : "rgba(255,255,255,0.12)" }} />
        ))}
      </div>

      <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", marginBottom: 12 }}>Вопрос {qIndex + 1} из {PLACEMENT_TEST.length}</div>
      <div style={{ fontSize: 20, fontWeight: 700, color: "#fff", marginBottom: 24, lineHeight: 1.4 }}>{q.prompt}</div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {q.options.map((opt, i) => (
          <button key={i} onClick={() => answer(i)} style={optStyle(i)}>
            <span style={{ marginRight: 10, opacity: 0.4, fontSize: 13 }}>{["A", "B", "C", "D"][i]}</span>
            {opt}
            {revealed && i === q.correct && <span style={{ float: "right" }}>✓</span>}
            {revealed && i === selected && selected !== q.correct && <span style={{ float: "right" }}>✗</span>}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── PLACEMENT RESULT ──────────────────────────────────────────
function PlacementResult({ level, score, onStart }) {
  const info = LEVEL_INFO[level];
  return (
    <div style={{ paddingTop: 60, textAlign: "center" }}>
      <div style={{ fontSize: 64, marginBottom: 16 }}>🎯</div>
      <div style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", marginBottom: 8 }}>Ты ответил правильно на {score} из 10</div>
      <div style={{ fontSize: 28, fontWeight: 800, color: "#fff", marginBottom: 24 }}>Твой уровень</div>
      <div style={{
        background: `rgba(${level === "A0" ? "16,185,129" : level === "A1" ? "124,92,252" : "245,158,11"},0.15)`,
        border: `1px solid ${info.color}40`,
        borderRadius: 20, padding: "28px 32px", marginBottom: 32, display: "inline-block",
      }}>
        <div style={{ fontSize: 48, fontWeight: 900, color: info.color, marginBottom: 4 }}>{level}</div>
        <div style={{ fontSize: 16, fontWeight: 600, color: "#fff" }}>{info.label.split("·")[1].trim()}</div>
        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>{info.desc}</div>
      </div>
      <button onClick={onStart} style={{ width: "100%", background: "#7C5CFC", color: "#fff", border: "none", borderRadius: 16, padding: "18px", fontSize: 16, fontWeight: 700, cursor: "pointer" }}>
        Начать учить →
      </button>
    </div>
  );
}

// ── AUTH SCREEN ───────────────────────────────────────────────
function AuthScreen() {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    if (mode === "login") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(error.message);
    } else {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) setError(error.message);
      else {
        if (username && data.user) {
          // retry a few times — profiles row is created by trigger asynchronously
          for (let i = 0; i < 5; i++) {
            await new Promise(r => setTimeout(r, 600));
            const { error: ue } = await supabase.from("profiles").update({ username }).eq("id", data.user.id);
            if (!ue) break;
          }
        }
        setDone(true);
      }
    }
    setLoading(false);
  }

  const inp = { width: "100%", padding: "14px 16px", borderRadius: 12, background: "rgba(255,255,255,0.06)", border: "1.5px solid rgba(255,255,255,0.12)", color: "#fff", fontSize: 15, outline: "none", boxSizing: "border-box" };

  if (done) return (
    <div style={{ paddingTop: 80, textAlign: "center" }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>📬</div>
      <div style={{ fontSize: 22, fontWeight: 700, color: "#fff", marginBottom: 8 }}>Проверь почту</div>
      <div style={{ fontSize: 14, color: "rgba(255,255,255,0.4)" }}>Отправили письмо с подтверждением на {email}</div>
    </div>
  );

  return (
    <div style={{ paddingTop: 60 }}>
      <div style={{ fontSize: 11, letterSpacing: 3, color: "#7C5CFC", fontWeight: 600, marginBottom: 12, textTransform: "uppercase" }}>DuoPar · Deutsch</div>
      <h1 style={{ fontSize: 28, fontWeight: 800, color: "#fff", margin: "0 0 32px" }}>
        {mode === "login" ? "Добро пожаловать" : "Создать аккаунт"}
      </h1>
      <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {mode === "register" && <input style={inp} placeholder="Никнейм (необязательно)" value={username} onChange={e => setUsername(e.target.value)} />}
        <input style={inp} type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
        <input style={inp} type="password" placeholder="Пароль" value={password} onChange={e => setPassword(e.target.value)} required />
        {error && <div style={{ fontSize: 13, color: "#ef4444", padding: "8px 12px", background: "rgba(239,68,68,0.1)", borderRadius: 8 }}>{error}</div>}
        <button type="submit" disabled={loading} style={{ background: "#7C5CFC", color: "#fff", border: "none", borderRadius: 14, padding: "16px", fontSize: 16, fontWeight: 700, cursor: "pointer", marginTop: 4, opacity: loading ? 0.6 : 1 }}>
          {loading ? "..." : mode === "login" ? "Войти" : "Зарегистрироваться"}
        </button>
      </form>
      <div style={{ textAlign: "center", marginTop: 20 }}>
        <button onClick={() => { setMode(m => m === "login" ? "register" : "login"); setError(""); }} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", fontSize: 14, cursor: "pointer", textDecoration: "underline" }}>
          {mode === "login" ? "Нет аккаунта? Зарегистрироваться" : "Уже есть аккаунт? Войти"}
        </button>
      </div>
    </div>
  );
}

// ── XP BAR ───────────────────────────────────────────────────
function XPBar({ xp, username, langLevel }) {
  const level = getLevel(xp);
  const progress = (xp % 200) / 200;
  const info = langLevel ? LEVEL_INFO[langLevel] : null;
  return (
    <div style={{ flex: 1 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        <span style={{ fontSize: 13, color: "#fff", fontWeight: 600 }}>
          {username || "Игрок"} · <span style={{ color: "#7C5CFC" }}>Ур. {level}</span>
          {info && <span style={{ marginLeft: 8, fontSize: 11, color: info.color, background: `${info.color}20`, padding: "2px 8px", borderRadius: 10 }}>{langLevel}</span>}
        </span>
        <span style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}>{xp} XP</span>
      </div>
      <div style={{ height: 6, background: "rgba(255,255,255,0.08)", borderRadius: 3, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${progress * 100}%`, background: "#7C5CFC", borderRadius: 3, transition: "width 0.6s ease" }} />
      </div>
    </div>
  );
}

// ── PROGRESS BAR ──────────────────────────────────────────────
function ProgressBar({ current, total }) {
  return (
    <div style={{ display: "flex", gap: 6, marginBottom: 24 }}>
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: i < current ? "#7C5CFC" : "rgba(255,255,255,0.12)", transition: "background 0.3s" }} />
      ))}
    </div>
  );
}

// ── PARTNER BUBBLE ────────────────────────────────────────────
function PartnerBubble({ answered, isCorrect }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 14, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", fontSize: 13, color: "rgba(255,255,255,0.6)" }}>
      <span style={{ fontSize: 20 }}>{PARTNER.avatar}</span>
      <div>
        <div style={{ fontWeight: 600, color: "rgba(255,255,255,0.85)", fontSize: 12 }}>{PARTNER.name} · {PARTNER.level}</div>
        <div>{answered === null ? "думает..." : isCorrect ? "✓ тоже правильно!" : "✗ ошиблась"}</div>
      </div>
      <div style={{ marginLeft: "auto", width: 8, height: 8, borderRadius: "50%", background: answered === null ? "#f59e0b" : isCorrect ? "#10b981" : "#ef4444", boxShadow: `0 0 6px ${answered === null ? "#f59e0b" : isCorrect ? "#10b981" : "#ef4444"}` }} />
    </div>
  );
}

// ── SETUP SCREEN ──────────────────────────────────────────────
function SetupScreen({ langLevel, onStart, onBack }) {
  const available = CATEGORIES_BY_LEVEL[langLevel] || CATEGORIES_BY_LEVEL["A1"];
  const [selected, setSelected] = useState(new Set(available));

  function toggle(cat) {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(cat)) { if (next.size > 1) next.delete(cat); } else next.add(cat);
      return next;
    });
  }

  return (
    <div style={{ paddingTop: 40 }}>
      <button onClick={onBack} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", fontSize: 13, cursor: "pointer", marginBottom: 20, padding: 0 }}>← Назад</button>
      <div style={{ fontSize: 11, letterSpacing: 3, color: "#7C5CFC", fontWeight: 600, marginBottom: 12, textTransform: "uppercase" }}>DuoPar · {langLevel}</div>
      <h1 style={{ fontSize: 28, fontWeight: 800, color: "#fff", margin: "0 0 20px" }}>Новая игра</h1>

      <div style={{ background: "rgba(16,185,129,0.07)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: 16, padding: "14px 16px", marginBottom: 24, display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 40, height: 40, borderRadius: 12, fontSize: 20, background: "rgba(124,92,252,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>{PARTNER.avatar}</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, color: "#fff", fontSize: 14 }}>{PARTNER.name} · партнёр найден</div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}>Уровень {PARTNER.level} · онлайн сейчас</div>
        </div>
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#10b981", boxShadow: "0 0 6px #10b981" }} />
      </div>

      <div style={{ fontSize: 14, color: "rgba(255,255,255,0.35)", marginBottom: 16 }}>Выбери темы для уровня {langLevel}</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 28 }}>
        {available.map(cat => {
          const on = selected.has(cat);
          return (
            <button key={cat} onClick={() => toggle(cat)} style={{ background: on ? "rgba(124,92,252,0.2)" : "rgba(255,255,255,0.04)", border: `1.5px solid ${on ? "#7C5CFC" : "rgba(255,255,255,0.1)"}`, borderRadius: 14, padding: "14px 12px", cursor: "pointer", textAlign: "left", transition: "all 0.2s" }}>
              <div style={{ fontSize: 22, marginBottom: 4 }}>{CATEGORY_ICONS[cat]}</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: on ? "#fff" : "rgba(255,255,255,0.5)" }}>{cat}</div>
              <div style={{ fontSize: 11, color: on ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.2)", marginTop: 2 }}>
                {ALL_QUESTIONS.filter(q => q.category === cat && q.level === langLevel).length} вопросов
              </div>
            </button>
          );
        })}
      </div>
      <button onClick={() => onStart([...selected])} style={{ width: "100%", background: "#7C5CFC", color: "#fff", border: "none", borderRadius: 16, padding: "18px", fontSize: 16, fontWeight: 700, cursor: "pointer" }}>
        Начать квест →
      </button>
    </div>
  );
}

// ── RESULT SCREEN ─────────────────────────────────────────────
function ResultScreen({ score, total, xpEarned, profile, onRestart, onProfile }) {
  const pct = Math.round((score / total) * 100);
  const emoji = pct >= 80 ? "🏆" : pct >= 60 ? "⭐" : "💪";
  const msg = pct >= 80 ? "Отлично сыграно!" : pct >= 60 ? "Хороший результат!" : "Продолжай тренироваться!";
  const partnerScore = Math.min(total, Math.max(0, score + Math.floor(Math.random() * 3) - 1));

  return (
    <div style={{ textAlign: "center", padding: "32px 0" }}>
      <div style={{ fontSize: 64, marginBottom: 16 }}>{emoji}</div>
      <div style={{ fontSize: 28, fontWeight: 700, color: "#fff", marginBottom: 8 }}>{msg}</div>
      <div style={{ fontSize: 15, color: "rgba(255,255,255,0.5)", marginBottom: 24 }}>Вы с Maria ответили правильно на</div>
      <div style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", background: "rgba(124,92,252,0.15)", border: "1px solid rgba(124,92,252,0.3)", borderRadius: 20, padding: "24px 48px", marginBottom: 20 }}>
        <div style={{ fontSize: 56, fontWeight: 800, color: "#7C5CFC" }}>{score}/{total}</div>
        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>{pct}% точность</div>
      </div>
      <div style={{ background: "rgba(124,92,252,0.1)", border: "1px solid rgba(124,92,252,0.2)", borderRadius: 14, padding: "14px 20px", marginBottom: 20, display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
        <span style={{ fontSize: 20 }}>⚡</span>
        <span style={{ color: "#7C5CFC", fontWeight: 700, fontSize: 16 }}>+{xpEarned} XP</span>
        <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 13 }}>· уровень {getLevel(profile?.xp || 0)}</span>
      </div>
      <div style={{ display: "flex", gap: 12, justifyContent: "center", marginBottom: 28 }}>
        {[{ label: profile?.username || "ты", val: score }, { label: "Maria", val: partnerScore }].map(x => (
          <div key={x.label} style={{ background: "rgba(255,255,255,0.05)", borderRadius: 12, padding: "12px 20px", textAlign: "center" }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: "#fff" }}>{x.val}</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{x.label}</div>
          </div>
        ))}
      </div>
      <button onClick={onRestart} style={{ background: "#7C5CFC", color: "#fff", border: "none", borderRadius: 14, padding: "16px 40px", fontSize: 16, fontWeight: 600, cursor: "pointer", width: "100%", marginBottom: 10 }}>
        Новый раунд →
      </button>
      <button onClick={onProfile} style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 14, padding: "14px 40px", fontSize: 15, fontWeight: 500, cursor: "pointer", width: "100%" }}>
        Мой профиль 🧑‍💻
      </button>
    </div>
  );
}

// ── PROFILE SCREEN ────────────────────────────────────────────
function ProfileScreen({ profile, session, onUpdate, onBack, onRetakeTest }) {
  const [editing, setEditing] = useState(false);
  const [username, setUsername] = useState(profile?.username || "");
  const [saving, setSaving] = useState(false);

  const xp = profile?.xp || 0;
  const level = getLevel(xp);
  const progress = (xp % 200) / 200;
  const langLevel = profile?.lang_level || "—";
  const info = LEVEL_INFO[langLevel];
  const LEVEL_TITLES = ["Новичок", "Ученик", "Практик", "Знаток", "Мастер", "Эксперт"];
  const title = LEVEL_TITLES[Math.min(level - 1, LEVEL_TITLES.length - 1)];

  async function save() {
    setSaving(true);
    await supabase.from("profiles").update({ username }).eq("id", session.user.id);
    onUpdate({ ...profile, username });
    setEditing(false);
    setSaving(false);
  }

  return (
    <div style={{ paddingTop: 60 }}>
      <button onClick={onBack} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", fontSize: 13, cursor: "pointer", marginBottom: 24, padding: 0 }}>← Назад</button>

      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <div style={{ width: 80, height: 80, borderRadius: 24, background: "rgba(124,92,252,0.2)", border: "2px solid rgba(124,92,252,0.4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, margin: "0 auto 16px" }}>🧑‍💻</div>
        {editing ? (
          <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 8 }}>
            <input value={username} onChange={e => setUsername(e.target.value)} style={{ padding: "8px 12px", borderRadius: 10, background: "rgba(255,255,255,0.08)", border: "1.5px solid rgba(124,92,252,0.5)", color: "#fff", fontSize: 16, fontWeight: 700, textAlign: "center", outline: "none" }} />
            <button onClick={save} disabled={saving} style={{ background: "#7C5CFC", color: "#fff", border: "none", borderRadius: 10, padding: "8px 14px", cursor: "pointer", fontWeight: 600 }}>{saving ? "..." : "✓"}</button>
          </div>
        ) : (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 4 }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: "#fff" }}>{profile?.username || "Игрок"}</div>
            <button onClick={() => setEditing(true)} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.3)", cursor: "pointer", fontSize: 14 }}>✏️</button>
          </div>
        )}
        <div style={{ fontSize: 13, color: "#7C5CFC", fontWeight: 600 }}>{title}</div>
      </div>

      {info && (
        <div style={{ background: `${info.color}15`, border: `1px solid ${info.color}30`, borderRadius: 14, padding: "14px 20px", marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginBottom: 4 }}>УРОВЕНЬ НЕМЕЦКОГО</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: info.color }}>{langLevel}</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>{info.desc}</div>
          </div>
          <button onClick={onRetakeTest} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "8px 14px", color: "rgba(255,255,255,0.5)", fontSize: 12, cursor: "pointer" }}>
            Пройти снова
          </button>
        </div>
      )}

      <div style={{ background: "rgba(124,92,252,0.1)", border: "1px solid rgba(124,92,252,0.2)", borderRadius: 20, padding: 20, marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>Уровень {level}</span>
          <span style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>{xp} XP</span>
        </div>
        <div style={{ height: 8, background: "rgba(255,255,255,0.08)", borderRadius: 4, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${progress * 100}%`, background: "#7C5CFC", borderRadius: 4, transition: "width 0.6s ease" }} />
        </div>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", marginTop: 8 }}>ещё {xpToNextLevel(xp)} XP до уровня {level + 1}</div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
        {[
          { label: "Раундов сыграно", value: profile?.rounds_played || 0, icon: "🎮" },
          { label: "Всего XP", value: xp, icon: "⚡" },
          { label: "Серия дней", value: `${profile?.streak || 0} 🔥`, icon: "📅" },
          { label: "До след. уровня", value: `${xpToNextLevel(xp)} XP`, icon: "🎯" },
        ].map(item => (
          <div key={item.label} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: "14px 16px" }}>
            <div style={{ fontSize: 20, marginBottom: 6 }}>{item.icon}</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#fff" }}>{item.value}</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>{item.label}</div>
          </div>
        ))}
      </div>

      {/* Map game stats */}
      {((profile?.map_wins || 0) + (profile?.map_losses || 0) + (profile?.map_draws || 0)) > 0 && (() => {
        const wins = profile?.map_wins || 0;
        const losses = profile?.map_losses || 0;
        const draws = profile?.map_draws || 0;
        const total = wins + losses + draws;
        const winPct = Math.round((wins / total) * 100);
        return (
          <div style={{ background: "rgba(245,158,11,0.07)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: 20, padding: 20, marginBottom: 16 }}>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", marginBottom: 14 }}>🗺️ Тур по Германии</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 14 }}>
              <div style={{ textAlign: "center", background: "rgba(124,92,252,0.12)", borderRadius: 12, padding: "10px 6px" }}>
                <div style={{ fontSize: 22, fontWeight: 900, color: "#a78bfa" }}>{wins}</div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>победы</div>
              </div>
              <div style={{ textAlign: "center", background: "rgba(239,68,68,0.1)", borderRadius: 12, padding: "10px 6px" }}>
                <div style={{ fontSize: 22, fontWeight: 900, color: "#f87171" }}>{losses}</div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>поражения</div>
              </div>
              <div style={{ textAlign: "center", background: "rgba(255,255,255,0.05)", borderRadius: 12, padding: "10px 6px" }}>
                <div style={{ fontSize: 22, fontWeight: 900, color: "rgba(255,255,255,0.5)" }}>{draws}</div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>ничьи</div>
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "rgba(255,255,255,0.35)", marginBottom: 6 }}>
              <span>{total} игр</span><span>Винрейт {winPct}%</span>
            </div>
            <div style={{ height: 6, borderRadius: 3, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${winPct}%`, background: "linear-gradient(90deg,#7C5CFC,#a78bfa)", borderRadius: 3 }} />
            </div>
          </div>
        );
      })()}

      <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: "16px 20px", marginBottom: 12 }}>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", marginBottom: 12 }}>Настройки аккаунта</div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>Email</span>
          <span style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", fontFamily: "monospace" }}>{session.user.email}</span>
        </div>
      </div>

      <button onClick={() => supabase.auth.signOut()} style={{ width: "100%", background: "rgba(239,68,68,0.1)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 14, padding: "14px", fontSize: 15, fontWeight: 600, cursor: "pointer" }}>
        Выйти из аккаунта
      </button>
    </div>
  );
}

// Связь тем курса с землями Германии — после прохождения темы открывается миссия
const TOPIC_TOUR_MISSION = {
  greetings:        { land: "Bayern",               flag: "🏔️" },
  articles:         { land: "Berlin",               flag: "🐻" },
  verbs_sein_haben: { land: "Hamburg",              flag: "⚓" },
  numbers:          { land: "Hessen",               flag: "🏦" },
  family:           { land: "Nordrhein-Westfalen",  flag: "🏭" },
  word_order:       { land: "Sachsen",              flag: "🏰" },
  colors:           { land: "Baden-Württemberg",    flag: "🌲" },
  food:             { land: "Niedersachsen",        flag: "🐴" },
  transport:        { land: "Brandenburg",          flag: "🌾" },
  city:             { land: "Bremen",               flag: "🚢" },
  weather:          { land: "Schleswig-Holstein",   flag: "🌊" },
  shopping:         { land: "Thüringen",            flag: "🌲" },
  health:           { land: "Sachsen-Anhalt",       flag: "⛪" },
  work:             { land: "Rheinland-Pfalz",      flag: "🍷" },
  hobbies:          { land: "Saarland",             flag: "⛏️" },
  travel:           { land: "Mecklenburg-Vorpommern", flag: "🌅" },
};

// ── КАРТА ГЕРМАНИИ ───────────────────────────────────────────
const STATE_ID_MAP = {
  "Schleswig-Holstein": "sh", "Hamburg": "hh", "Mecklenburg-Vorpommern": "mv",
  "Niedersachsen": "ni", "Bremen": "hb", "Brandenburg": "bb", "Berlin": "be",
  "Sachsen-Anhalt": "st", "Nordrhein-Westfalen": "nw", "Sachsen": "sn",
  "Thüringen": "th", "Hessen": "he", "Rheinland-Pfalz": "rp",
  "Saarland": "sl", "Baden-Württemberg": "bw", "Bayern": "by",
};

const BOT_NAMES = ["Фридрих", "Гёте", "Бах", "Кант", "Бисмарк", "Шиллер"];

const GEO_URL = "https://raw.githubusercontent.com/isellsoap/deutschlandGeoJSON/master/2_bundeslaender/4_niedrig.geo.json";

const LON_MIN = 5.87, LON_MAX = 15.05, LAT_MIN = 47.27, LAT_MAX = 55.06;
function project(lon, lat, W, H) {
  return [((lon - LON_MIN) / (LON_MAX - LON_MIN)) * W, ((LAT_MAX - lat) / (LAT_MAX - LAT_MIN)) * H];
}
function ringToD(ring, W, H) {
  return ring.map(([lon, lat], i) => { const [x, y] = project(lon, lat, W, H); return `${i===0?"M":"L"}${x.toFixed(1)},${y.toFixed(1)}`; }).join(" ") + "Z";
}
function featureToD(feature, W, H) {
  const g = feature.geometry;
  if (g.type === "Polygon") return g.coordinates.map(r => ringToD(r, W, H)).join(" ");
  if (g.type === "MultiPolygon") return g.coordinates.flatMap(p => p.map(r => ringToD(r, W, H))).join(" ");
  return "";
}
function centroid(feature) {
  const g = feature.geometry;
  const ring = g.type === "Polygon" ? g.coordinates[0] : g.coordinates[0][0];
  const n = ring.length;
  let sLon = 0, sLat = 0;
  ring.forEach(([lon, lat]) => { sLon += lon; sLat += lat; });
  return [sLon / n, sLat / n];
}

const CAT_EMOJI = { "Основы":"🔤","Природа":"🌿","Еда":"🍕","Город":"🏙️","Дом":"🏠","Чувства":"❤️","Грамматика":"📚","Время":"⏰","Люди":"👤","Глаголы":"🏃","Прилагательные":"✨","Разное":"🎲" };

function MapGameScreen({ onBack, session, profile }) {
  const [geoFeatures, setGeoFeatures] = useState(null);
  const [phase, setPhase] = useState("matchmaking");
  const [cdMatch, setCdMatch] = useState(5);
  const [botName, setBotName] = useState(() => BOT_NAMES[Math.floor(Math.random() * BOT_NAMES.length)]);

  // ── ONLINE STATE ──
  const [onlineMode, setOnlineMode] = useState(false);
  const [onlineSetup, setOnlineSetup] = useState("choice"); // choice | creating | waiting | joining | searching
  const lobbyRef = useRef(null);
  const matchedRef = useRef(false);
  const [myRole, setMyRole] = useState(null); // "host" | "guest"
  const [roomCode, setRoomCode] = useState("");
  const [joinInput, setJoinInput] = useState("");
  const channelRef = useRef(null);
  const myRoleRef = useRef(null);
  const onlineModeRef = useRef(false);
  const [territories, setTerritories] = useState({});
  // sub-phases: territory_select | selecting | topic_select | answering | duel | battle | round_result
  const [rPhase, setRPhase] = useState("territory_select");
  const [playerPick, setPlayerPick] = useState(null);
  const [botPick, setBotPick] = useState(null);
  const [botPickRevealed, setBotPickRevealed] = useState(false);
  const [isDuel, setIsDuel] = useState(false);
  const [isBattle, setIsBattle] = useState(false);
  const [question, setQuestion] = useState(null);
  const [pAnswer, setPAnswer] = useState(null);
  const [botDone, setBotDone] = useState(false);
  const [botOk, setBotOk] = useState(null);
  const [duelSecs, setDuelSecs] = useState(10);
  const [duelPlayerMs, setDuelPlayerMs] = useState(null);
  const [duelBotMs, setDuelBotMs] = useState(null);
  const duelStartRef = useRef(null);
  const [battleScore, setBattleScore] = useState({ player: 0, bot: 0 });
  const [battleRound, setBattleRound] = useState(0);
  const [topicTurn, setTopicTurn] = useState("player"); // "player" | "bot" — кто выбирает тему
  const [availableCats, setAvailableCats] = useState([]);
  const [playerCat, setPlayerCat] = useState(null);
  const [botCat, setBotCat] = useState(null);
  const [autoPickTerr, setAutoPickTerr] = useState(null); // territory being auto-selected (blink)
  const [roundMsg, setRoundMsg] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);

  const terrRef = useRef({});
  const qRef = useRef(null);
  const pPickRef = useRef(null);
  const bPickRef = useRef(null);
  const botOkRef = useRef(null);
  const pAnsRef = useRef(null);
  const botDuelRef = useRef(null);
  const duelIvRef = useRef(null);
  const battleScoreRef = useRef({ player: 0, bot: 0 });
  const battleRoundRef = useRef(0);
  const battleQsRef = useRef([]);

  useEffect(() => { fetch(GEO_URL).then(r => r.json()).then(d => setGeoFeatures(d.features)); }, []);
  useEffect(() => {
    if (phase !== "matchmaking") return;
    if (cdMatch <= 0) { setPhase("playing"); return; }
    const t = setTimeout(() => setCdMatch(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, cdMatch]);
  useEffect(() => () => { clearTimeout(botDuelRef.current); clearInterval(duelIvRef.current); }, []);

  // ── ONLINE: cleanup channel on unmount ──
  useEffect(() => () => { channelRef.current?.unsubscribe(); }, []);

  function myUsername() { return profile?.username || session?.user?.email?.split("@")[0] || "Игрок"; }

  function sendOnline(event, payload) {
    channelRef.current?.send({ type: "broadcast", event, payload });
  }

  function setupChannel(code, role) {
    const ch = supabase.channel(`mapgame-${code}`, { config: { broadcast: { self: false } } });

    ch.on("broadcast", { event: "territory_pick" }, ({ payload }) => {
      setBotPick(payload.sid); bPickRef.current = payload.sid;
      setBotPickRevealed(true);
      // if I already picked, proceed
      if (pPickRef.current) proceedOnlinePicks(pPickRef.current, payload.sid);
    });

    ch.on("broadcast", { event: "topic_pick" }, ({ payload }) => {
      // opponent chose — both answer the same question
      setBotCat(payload.cat);
      startAnsweringPhase(payload.cat);
    });

    ch.on("broadcast", { event: "answer" }, ({ payload }) => {
      botOkRef.current = payload.correct; setBotOk(payload.correct);
      if (payload.ms) setDuelBotMs(payload.ms);
      setBotDone(true);
    });

    ch.on("broadcast", { event: "round_result" }, ({ payload }) => {
      // guest applies host's resolved state
      if (myRoleRef.current === "guest") {
        terrRef.current = payload.territories;
        setTerritories(payload.territories);
        setRoundMsg(payload.msg);
        setRPhase("round_result");
        if (payload.confetti) setShowConfetti(true);
        if (Object.keys(payload.territories).length >= 16) setTimeout(() => setPhase("gameover"), 2200);
      }
    });

    ch.on("broadcast", { event: "next_round" }, () => {
      if (myRoleRef.current === "guest") nextRoundOnline();
    });

    ch.on("broadcast", { event: "opponent_joined" }, ({ payload }) => {
      setBotName(payload.username);
      setOnlineSetup("ready");
      setPhase("playing");
      setOnlineMode(true); onlineModeRef.current = true;
    });

    ch.on("broadcast", { event: "start_game" }, ({ payload }) => {
      setBotName(payload.hostUsername);
      setOnlineSetup("ready");
      setPhase("playing");
      setOnlineMode(true); onlineModeRef.current = true;
    });

    ch.subscribe();
    channelRef.current = ch;
  }

  function createRoom() {
    const code = Math.random().toString(36).substring(2, 7).toUpperCase();
    setRoomCode(code);
    setMyRole("host"); myRoleRef.current = "host";
    setOnlineSetup("waiting");
    setupChannel(code, "host");
  }

  function joinRoom() {
    const code = joinInput.trim().toUpperCase();
    if (!code) return;
    setRoomCode(code);
    setMyRole("guest"); myRoleRef.current = "guest";
    setOnlineSetup("joining");
    setupChannel(code, "guest");
    // notify host
    setTimeout(() => {
      sendOnline("opponent_joined", { username: myUsername() });
      sendOnline("start_game", { hostUsername: myUsername() });
    }, 800);
  }

  function searchOpponent() {
    matchedRef.current = false;
    setOnlineSetup("searching");
    const myLevel = profile?.lang_level || "A1";
    const lobby = supabase.channel(`matchmaking-lobby-${myLevel}`, { config: { broadcast: { self: false } } });
    lobbyRef.current = lobby;

    lobby.on("broadcast", { event: "looking" }, ({ payload }) => {
      // I received someone looking — I become host, create room, invite them
      if (matchedRef.current) return;
      matchedRef.current = true;
      lobby.send({ type: "broadcast", event: "matched", payload: { to: payload.id, hostId: myUsername(), code: "" } });
      // generate code and setup
      const code = Math.random().toString(36).substring(2, 7).toUpperCase();
      setRoomCode(code);
      setMyRole("host"); myRoleRef.current = "host";
      lobby.send({ type: "broadcast", event: "invite", payload: { to: payload.id, code, hostUsername: myUsername() } });
      lobby.unsubscribe();
      setupChannel(code, "host");
      setOnlineSetup("waiting");
    });

    lobby.on("broadcast", { event: "invite" }, ({ payload }) => {
      // I was invited by host
      if (matchedRef.current) return;
      if (payload.to !== myUsername()) return;
      matchedRef.current = true;
      lobby.unsubscribe();
      const code = payload.code;
      setRoomCode(code);
      setMyRole("guest"); myRoleRef.current = "guest";
      setupChannel(code, "guest");
      setTimeout(() => {
        sendOnline("opponent_joined", { username: myUsername() });
        sendOnline("start_game", { hostUsername: myUsername() });
      }, 800);
    });

    lobby.subscribe(() => {
      // announce I'm looking
      setTimeout(() => {
        if (!matchedRef.current) {
          lobby.send({ type: "broadcast", event: "looking", payload: { id: myUsername() } });
        }
      }, 400);
    });

    // fallback to bot after 15s
    setTimeout(() => {
      if (!matchedRef.current) {
        matchedRef.current = true;
        lobby.unsubscribe();
        setPhase("playing");
      }
    }, 15000);
  }

  function proceedOnlinePicks(myPick, theirPick) {
    setRPhase("selecting");
    const iAttackThem = terrRef.current[myPick] === "bot";
    const theyAttackMe = terrRef.current[theirPick] === "player";
    setTimeout(() => {
      if (myPick === theirPick) {
        setIsDuel(true); setIsBattle(false);
        startDuel(myPick);
      } else if (iAttackThem) {
        setIsBattle(true); setIsDuel(false);
        startBattle(myPick);
      } else if (theyAttackMe) {
        setIsBattle(true); setIsDuel(false);
        startBattle(theirPick);
      } else {
        setIsDuel(false); setIsBattle(false);
        enterTopicSelect();
      }
    }, 1200);
  }

  function nextRoundOnline() {
    setPlayerPick(null); pPickRef.current = null;
    setBotPick(null); bPickRef.current = null;
    setBotPickRevealed(false);
    setIsDuel(false); setIsBattle(false);
    setQuestion(null); qRef.current = null;
    setPAnswer(null); pAnsRef.current = null;
    setBotDone(false); setBotOk(null); botOkRef.current = null;
    setBattleScore({ player: 0, bot: 0 }); battleScoreRef.current = { player: 0, bot: 0 };
    setBattleRound(0); battleRoundRef.current = 0;
    setRoundMsg(null); setDuelSecs(10); setDuelPlayerMs(null); setDuelBotMs(null); setShowConfetti(false);
    setTopicTurn(t => t === "player" ? "bot" : "player"); setPlayerCat(null); setBotCat(null); setAvailableCats([]);
    setRPhase("territory_select");
  }

  const cats = [...new Set(ALL_QUESTIONS.map(q => q.category).filter(Boolean))];
  function pickQ(cat) {
    const pool = cat ? ALL_QUESTIONS.filter(q => q.category === cat) : ALL_QUESTIONS;
    return (pool.length ? pool : ALL_QUESTIONS)[Math.floor(Math.random() * (pool.length || ALL_QUESTIONS.length))];
  }
  function getStateId(f) { return STATE_ID_MAP[f.properties.GEN || f.properties.NAME_1 || f.properties.name || ""] || null; }
  function stateName(id) { return Object.keys(STATE_ID_MAP).find(k => STATE_ID_MAP[k] === id) || id; }


  function handleTerritoryClick(sid) {
    if (rPhase !== "territory_select" || territories[sid] === "player") return;

    setPlayerPick(sid); pPickRef.current = sid;

    if (onlineModeRef.current) {
      sendOnline("territory_pick", { sid });
      if (bPickRef.current !== null) proceedOnlinePicks(sid, bPickRef.current);
      return;
    }

    // ── BOT MODE ──
    const isEnemyTerritory = territories[sid] === "bot";
    setRPhase("selecting");

    if (isEnemyTerritory) {
      setBotPick(sid); bPickRef.current = sid;
      setBotPickRevealed(true);
      setIsBattle(true); setIsDuel(false);
      setTimeout(() => startBattle(sid), 1200);
      return;
    }

    const bPick = bPickRef.current;
    setIsBattle(false);
    if (bPick === sid) {
      setIsDuel(true);
      setTimeout(() => startDuel(sid), 1200);
    } else {
      setIsDuel(false);
      setTimeout(() => enterTopicSelect(), 1200);
    }
  }

  // ── BATTLE (attack enemy territory, best of 3) ──
  function startBattle(sid) {
    const qs = [pickQ(null), pickQ(null), pickQ(null)];
    battleQsRef.current = qs;
    battleScoreRef.current = { player: 0, bot: 0 };
    battleRoundRef.current = 0;
    setBattleScore({ player: 0, bot: 0 });
    setBattleRound(0);
    setIsBattle(true);
    loadBattleQuestion(0);
  }

  function loadBattleQuestion(round) {
    const q = battleQsRef.current[round];
    setQuestion(q); qRef.current = q;
    setPAnswer(null); pAnsRef.current = null;
    setBotDone(false); setBotOk(null); botOkRef.current = null;
    setRPhase("battle");
    setTimeout(() => {
      const ok = Math.random() < 0.65;
      botOkRef.current = ok; setBotOk(ok); setBotDone(true);
    }, 1200 + Math.random() * 2200);
  }

  useEffect(() => {
    if (rPhase !== "battle" || pAnswer === null || !botDone) return;
    const t = setTimeout(advanceBattle, 1100);
    return () => clearTimeout(t);
  }, [pAnswer, botDone, rPhase]);

  function advanceBattle() {
    const pCorrect = pAnsRef.current === qRef.current?.correct;
    const bCorrect = botOkRef.current === true;
    const newScore = {
      player: battleScoreRef.current.player + (pCorrect ? 1 : 0),
      bot: battleScoreRef.current.bot + (bCorrect ? 1 : 0),
    };
    battleScoreRef.current = newScore;
    setBattleScore(newScore);
    const nextR = battleRoundRef.current + 1;
    battleRoundRef.current = nextR;
    setBattleRound(nextR);

    if (nextR >= 3) {
      // battle over
      const sid = pPickRef.current;
      const newTerr = { ...terrRef.current };
      let msg;
      if (newScore.player > newScore.bot) {
        newTerr[sid] = "player";
        msg = `Победа в битве ${newScore.player}–${newScore.bot}! Земля ${stateName(sid)} теперь твоя! 🏆`;
        setShowConfetti(true);
      } else if (newScore.bot > newScore.player) {
        msg = `${botName} отбился ${newScore.bot}–${newScore.player}. Земля осталась у него.`;
      } else {
        msg = `Ничья ${newScore.player}–${newScore.bot}. Земля осталась у ${botName}.`;
      }
      terrRef.current = newTerr;
      setTerritories(newTerr);
      setRoundMsg(msg);
      setRPhase("round_result");
      checkGameOver(newTerr);
      return;
    }
    loadBattleQuestion(nextR);
  }

  // ── DUEL (both picked same unclaimed territory) ──
  function startDuel(sid) {
    const q = pickQ(null);
    setQuestion(q); qRef.current = q;
    setPAnswer(null); pAnsRef.current = null;
    setBotDone(false); setBotOk(null); botOkRef.current = null;
    setDuelSecs(10); setDuelPlayerMs(null); setDuelBotMs(null);
    setIsDuel(true);
    setRPhase("duel");
    duelStartRef.current = Date.now();

    const delay = 2500 + Math.random() * 4500;
    botDuelRef.current = setTimeout(() => {
      const ok = Math.random() < 0.7;
      botOkRef.current = ok; setBotOk(ok); setBotDone(true);
      setDuelBotMs(Date.now() - duelStartRef.current);
      if (pAnsRef.current === null) { clearInterval(duelIvRef.current); setTimeout(() => resolveDuel(null), 800); }
    }, delay);

    duelIvRef.current = setInterval(() => {
      setDuelSecs(s => {
        if (s <= 1) {
          clearInterval(duelIvRef.current); clearTimeout(botDuelRef.current);
          if (pAnsRef.current === null) {
            const ok = Math.random() < 0.7;
            botOkRef.current = ok; setBotOk(ok); setBotDone(true);
            setTimeout(() => resolveDuel(null), 400);
          }
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  }

  function handleDuelAnswer(idx) {
    if (pAnsRef.current !== null || rPhase !== "duel") return;
    clearInterval(duelIvRef.current);
    setPAnswer(idx); pAnsRef.current = idx;
    setDuelPlayerMs(Date.now() - (duelStartRef.current || Date.now()));
    const pCorrect = idx === qRef.current?.correct;
    playSound(pCorrect ? "correct" : "wrong");
    if (botOkRef.current === null) {
      if (pCorrect) {
        clearTimeout(botDuelRef.current);
        botOkRef.current = false; setBotOk(false); setBotDone(true);
        setTimeout(() => resolveDuel(idx), 1000);
      } else {
        setTimeout(() => {
          if (botOkRef.current === null) { clearTimeout(botDuelRef.current); const ok = Math.random() < 0.7; botOkRef.current = ok; setBotOk(ok); setBotDone(true); }
          setTimeout(() => resolveDuel(idx), 400);
        }, 2000);
      }
    } else {
      setTimeout(() => resolveDuel(idx), 1000);
    }
  }

  function resolveDuel(pIdx) {
    clearTimeout(botDuelRef.current); clearInterval(duelIvRef.current);
    const pCorrect = pIdx !== null && pIdx === qRef.current?.correct;
    const bCorrect = botOkRef.current === true;
    const sid = pPickRef.current;
    const newTerr = { ...terrRef.current };
    let msg;
    if (pCorrect) { newTerr[sid] = "player"; msg = bCorrect ? "Оба правы, но ты быстрее! 🏆" : "Правильно! Земля твоя! 🏆"; setShowConfetti(true); }
    else if (bCorrect) { newTerr[sid] = "bot"; msg = `${botName} ответил правильно и захватил землю!`; }
    else { msg = "Никто не ответил правильно — земля осталась свободной."; }
    terrRef.current = newTerr; setTerritories(newTerr); setRoundMsg(msg); setRPhase("round_result");
    checkGameOver(newTerr);
  }

  // ── TOPIC SELECT ──
  // topicTurn: whose turn it is to PICK the topic this round ("player"|"bot")
  // Both players answer the SAME question from the chosen topic
  function enterTopicSelect() {
    const allCats = [...new Set(ALL_QUESTIONS.map(q => q.category).filter(Boolean))];
    const four = [...allCats].sort(() => Math.random() - 0.5).slice(0, 4);
    setAvailableCats(four);
    setPlayerCat(null);
    setBotCat(null);
    setRPhase("topic_select");

    // if bot's turn to pick — bot picks after short delay
    if (topicTurn === "bot") {
      setTimeout(() => {
        const botChoice = four[Math.floor(Math.random() * four.length)];
        setBotCat(botChoice);
        if (onlineModeRef.current) {
          sendOnline("topic_pick", { cat: botChoice });
        } else {
          startAnsweringPhase(botChoice);
        }
      }, 1200 + Math.random() * 800);
    }
  }

  function handleCategoryPick(cat) {
    if (topicTurn !== "player") return;
    setPlayerCat(cat);
    if (onlineModeRef.current) {
      sendOnline("topic_pick", { cat });
    } else {
      startAnsweringPhase(cat);
    }
  }

  function startAnsweringPhase(cat) {
    // both players get the SAME question from the chosen category
    const q = pickQ(cat);
    setQuestion(q); qRef.current = q;
    setPAnswer(null); pAnsRef.current = null;
    setBotDone(false); setBotOk(null); botOkRef.current = null;
    setRPhase("answering");
    if (!onlineModeRef.current) {
      setTimeout(() => { const ok = Math.random() < 0.7; botOkRef.current = ok; setBotOk(ok); setBotDone(true); }, 1500 + Math.random() * 2000);
    }
  }

  // ── ANSWERING ──
  function handleAnswer(idx) {
    if (pAnsRef.current !== null || (rPhase !== "answering" && rPhase !== "battle")) return;
    setPAnswer(idx); pAnsRef.current = idx;
    const correct = idx === qRef.current?.correct;
    playSound(correct ? "correct" : "wrong");
    if (onlineModeRef.current) sendOnline("answer", { correct, ms: duelStartRef.current ? Date.now() - duelStartRef.current : null });
  }

  useEffect(() => {
    if (rPhase !== "answering" || pAnswer === null || !botDone) return;
    const t = setTimeout(resolveRound, 1000);
    return () => clearTimeout(t);
  }, [pAnswer, botDone, rPhase]);

  function resolveRound() {
    const pCorrect = pAnsRef.current === qRef.current?.correct;
    const bCorrect = botOkRef.current === true;
    const sid = pPickRef.current, bsid = bPickRef.current;
    const newTerr = { ...terrRef.current };
    const msgs = [];
    if (pCorrect && sid) { newTerr[sid] = "player"; msgs.push("Ты захватил землю! 🟣"); setShowConfetti(true); }
    else if (sid) msgs.push("Ты ответил неправильно.");
    if (bCorrect && bsid) { newTerr[bsid] = "bot"; msgs.push(`${botName} захватил землю! 🟡`); }
    else if (bsid) msgs.push(`${botName} не захватил землю.`);
    terrRef.current = newTerr; setTerritories(newTerr);
    const msg = msgs.join(" · ");
    setRoundMsg(msg); setRPhase("round_result");
    // host broadcasts result to guest
    if (onlineModeRef.current && myRoleRef.current === "host") {
      sendOnline("round_result", { territories: newTerr, msg, confetti: pCorrect });
    }
    checkGameOver(newTerr);
  }

  function checkGameOver(terr) {
    const allIds = Object.values(STATE_ID_MAP);
    const unclaimed = allIds.filter(id => !terr[id]);
    if (unclaimed.length === 0) {
      const ps = Object.values(terr).filter(v => v === "player").length;
      const bs = Object.values(terr).filter(v => v === "bot").length;
      const result = ps > bs ? "win" : ps < bs ? "loss" : "draw";
      if (session?.user?.id) {
        supabase.rpc("increment_map_stat", { uid: session.user.id, result }).catch(() => {});
      }
      setTimeout(() => { setShowConfetti(false); setPhase("gameover"); }, 1800);
      return true;
    }
    return false;
  }

  function nextRound() {
    // check if anything left to play
    if (checkGameOver(terrRef.current)) return;

    setPlayerPick(null); pPickRef.current = null;
    setBotPick(null); bPickRef.current = null;
    setBotPickRevealed(false);
    setIsDuel(false); setIsBattle(false);
    setQuestion(null); qRef.current = null;
    setPAnswer(null); pAnsRef.current = null;
    setBotDone(false); setBotOk(null); botOkRef.current = null;
    setBattleScore({ player: 0, bot: 0 }); battleScoreRef.current = { player: 0, bot: 0 };
    setBattleRound(0); battleRoundRef.current = 0;
    setRoundMsg(null); setDuelSecs(10); setDuelPlayerMs(null); setDuelBotMs(null); setShowConfetti(false);
    setTopicTurn(t => t === "player" ? "bot" : "player"); setPlayerCat(null); setBotCat(null); setAvailableCats([]);
    setRPhase("territory_select");
    if (onlineModeRef.current) {
      if (myRoleRef.current === "host") sendOnline("next_round", {});
    } else {
      setTimeout(() => {
        const allIds = Object.values(STATE_ID_MAP);
        const unclaimed = allIds.filter(id => !terrRef.current[id]);
        if (!unclaimed.length) return;
        const bPick = unclaimed[Math.floor(Math.random() * unclaimed.length)];
        setBotPick(bPick); bPickRef.current = bPick;
        setBotPickRevealed(true);
      }, 600);
    }
  }

  function restartGame() {
    terrRef.current = {}; setTerritories({});
    setOnlineMode(false); onlineModeRef.current = false;
    setOnlineSetup("choice"); setMyRole(null); myRoleRef.current = null;
    setRoomCode(""); setJoinInput("");
    channelRef.current?.unsubscribe(); channelRef.current = null;
    setPhase("matchmaking"); setCdMatch(5); nextRound();
  }

  // auto-advance from round_result after 2.5s
  useEffect(() => {
    if (rPhase !== "round_result") return;
    const t = setTimeout(nextRound, 2500);
    return () => clearTimeout(t);
  }, [rPhase]);

  // auto-pick last remaining territory with blink animation
  useEffect(() => {
    if (rPhase !== "territory_select") return;
    const allIds = Object.values(STATE_ID_MAP);
    // selectable = unclaimed + bot territories (player can attack both)
    const selectable = allIds.filter(id => !terrRef.current[id] || terrRef.current[id] === "bot");
    if (selectable.length !== 1) return;
    const lastId = selectable[0];
    setAutoPickTerr(lastId);
    const t = setTimeout(() => {
      setAutoPickTerr(null);
      handleTerritoryClick(lastId);
    }, 1800);
    return () => clearTimeout(t);
  }, [rPhase, territories]);

  const pScore = Object.values(territories).filter(v => v === "player").length;
  const bScore = Object.values(territories).filter(v => v === "bot").length;
  const W = 310, H = 370;

  function getFill(sid) {
    if (sid === playerPick) return "#a78bfa";
    if (sid === botPick && botPickRevealed) return "#fcd34d";
    if (territories[sid] === "player") return "#7C5CFC";
    if (territories[sid] === "bot") return "#f59e0b";
    return "#2a2040";
  }
  function getAutoPickStyle(sid) {
    if (sid !== autoPickTerr) return {};
    return { animation: "autoPick 0.5s ease-in-out infinite alternate" };
  }
  function getOpacity(sid) {
    if (sid === playerPick || sid === botPick) return 0.95;
    if (territories[sid]) return 0.88;
    return rPhase === "territory_select" ? 0.65 : 0.55;
  }
  function getStroke(sid) {
    if (sid === playerPick) return "#c4b5fd";
    if (sid === botPick && rPhase !== "territory_select") return "#fcd34d";
    return "#0f0d1a";
  }

  const ANIM_CSS = `
    @keyframes spin{to{transform:rotate(360deg)}}
    @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
    @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
    @keyframes flash{0%,100%{opacity:1}50%{opacity:0.6}}
    @keyframes winGlow{0%{fill:#7C5CFC;filter:drop-shadow(0 0 4px #7C5CFC)}50%{fill:#c4b5fd;filter:drop-shadow(0 0 12px #a78bfa)}100%{fill:#7C5CFC;filter:drop-shadow(0 0 4px #7C5CFC)}}
    @keyframes loseGlow{0%{fill:#f59e0b;filter:drop-shadow(0 0 4px #f59e0b)}50%{fill:#fde68a;filter:drop-shadow(0 0 10px #fcd34d)}100%{fill:#f59e0b;filter:drop-shadow(0 0 4px #f59e0b)}}
    @keyframes autoPick{from{fill:#2a2040;filter:drop-shadow(0 0 6px #fff)}to{fill:#e2e8f0;filter:drop-shadow(0 0 14px #fff)}}
  `;

  // ── MATCHMAKING ──
  if (phase === "matchmaking") {
    // Online: create room
    if (onlineSetup === "creating" || onlineSetup === "waiting") return (
      <div style={{ paddingTop: 60, textAlign: "center", animation: "fadeUp 0.3s ease" }}>
        <style>{ANIM_CSS}</style>
        <button onClick={() => { setOnlineSetup("choice"); channelRef.current?.unsubscribe(); }} style={{ position: "absolute", top: 20, left: 16, background: "transparent", border: "none", color: "rgba(255,255,255,0.4)", fontSize: 22, cursor: "pointer" }}>←</button>
        <div style={{ fontSize: 40, marginBottom: 16 }}>🔗</div>
        <div style={{ fontSize: 18, fontWeight: 800, color: "#fff", marginBottom: 8 }}>Твой код комнаты</div>
        <div style={{ fontSize: 48, fontWeight: 900, color: "#7C5CFC", letterSpacing: 8, margin: "20px 0", fontFamily: "monospace" }}>{roomCode}</div>
        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginBottom: 36 }}>Отправь этот код другу — он введёт его у себя</div>
        <div style={{ width: 48, height: 48, borderRadius: "50%", border: "3px solid rgba(124,92,252,0.3)", borderTopColor: "#7C5CFC", margin: "0 auto 20px", animation: "spin 1s linear infinite" }} />
        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.3)" }}>Ждём соперника...</div>
      </div>
    );

    // Online: join room
    if (onlineSetup === "joining") return (
      <div style={{ paddingTop: 60, textAlign: "center", animation: "fadeUp 0.3s ease" }}>
        <style>{ANIM_CSS}</style>
        <button onClick={() => setOnlineSetup("choice")} style={{ position: "absolute", top: 20, left: 16, background: "transparent", border: "none", color: "rgba(255,255,255,0.4)", fontSize: 22, cursor: "pointer" }}>←</button>
        <div style={{ fontSize: 40, marginBottom: 16 }}>🔑</div>
        <div style={{ fontSize: 18, fontWeight: 800, color: "#fff", marginBottom: 24 }}>Введи код комнаты</div>
        <input value={joinInput} onChange={e => setJoinInput(e.target.value.toUpperCase())} placeholder="ABCDE" maxLength={5}
          style={{ width: "100%", background: "rgba(255,255,255,0.07)", border: "1px solid rgba(124,92,252,0.4)", borderRadius: 14, padding: "16px", fontSize: 28, fontWeight: 800, color: "#fff", textAlign: "center", letterSpacing: 6, marginBottom: 20, boxSizing: "border-box", fontFamily: "monospace" }} />
        <button onClick={joinRoom} disabled={joinInput.length < 3}
          style={{ width: "100%", background: joinInput.length >= 3 ? "#7C5CFC" : "rgba(255,255,255,0.08)", border: "none", borderRadius: 14, padding: "16px", fontSize: 16, fontWeight: 700, color: joinInput.length >= 3 ? "#fff" : "rgba(255,255,255,0.3)", cursor: joinInput.length >= 3 ? "pointer" : "default" }}>
          Войти в комнату →
        </button>
      </div>
    );

    // Searching for random opponent
    if (onlineSetup === "searching") return (
      <div style={{ paddingTop: 60, textAlign: "center", animation: "fadeUp 0.3s ease" }}>
        <style>{ANIM_CSS}</style>
        <button onClick={() => { matchedRef.current = true; lobbyRef.current?.unsubscribe(); setOnlineSetup("choice"); }} style={{ position: "absolute", top: 20, left: 16, background: "transparent", border: "none", color: "rgba(255,255,255,0.4)", fontSize: 22, cursor: "pointer" }}>←</button>
        <div style={{ fontSize: 40, marginBottom: 20 }}>🌐</div>
        <div style={{ fontSize: 18, fontWeight: 800, color: "#fff", marginBottom: 8 }}>Ищем соперника</div>
        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginBottom: 8 }}>Подбираем игрока уровня <span style={{ color: "#a78bfa", fontWeight: 700 }}>{profile?.lang_level || "A1"}</span></div>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.2)", marginBottom: 28 }}>Только игроки твоего уровня</div>
        <div style={{ width: 56, height: 56, borderRadius: "50%", border: "3px solid rgba(124,92,252,0.3)", borderTopColor: "#7C5CFC", margin: "0 auto 28px", animation: "spin 1s linear infinite" }} />
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.25)" }}>Если никого нет — через 15 сек играешь с ботом</div>
      </div>
    );

    // Default: choice screen
    return (
      <div style={{ paddingTop: 60, textAlign: "center", animation: "fadeUp 0.3s ease" }}>
        <style>{ANIM_CSS}</style>
        <button onClick={onBack} style={{ position: "absolute", top: 20, left: 16, background: "transparent", border: "none", color: "rgba(255,255,255,0.4)", fontSize: 22, cursor: "pointer" }}>←</button>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🗺️</div>
        <div style={{ fontSize: 20, fontWeight: 800, color: "#fff", marginBottom: 8 }}>Тур по Германии</div>
        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginBottom: 36 }}>Выбери формат игры</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <button onClick={searchOpponent}
            style={{ width: "100%", background: "linear-gradient(135deg,#10b981,#34d399)", border: "none", borderRadius: 16, padding: "18px", fontSize: 16, fontWeight: 700, color: "#fff", cursor: "pointer", textAlign: "left" }}>
            <div>🌐 Парная миссия онлайн</div>
            <div style={{ fontSize: 12, fontWeight: 400, opacity: 0.8, marginTop: 4 }}>Найти партнёра и пройти задания вместе</div>
          </button>
          <button onClick={() => { setOnlineSetup("creating"); createRoom(); }}
            style={{ width: "100%", background: "rgba(124,92,252,0.15)", border: "1px solid rgba(124,92,252,0.3)", borderRadius: 16, padding: "16px", fontSize: 15, fontWeight: 700, color: "#a78bfa", cursor: "pointer", textAlign: "left" }}>
            <div>👥 Пригласить друга</div>
            <div style={{ fontSize: 12, fontWeight: 400, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>Создать комнату и отправить код</div>
          </button>
          <button onClick={() => setOnlineSetup("joining")}
            style={{ width: "100%", background: "rgba(124,92,252,0.08)", border: "1px solid rgba(124,92,252,0.2)", borderRadius: 16, padding: "14px", fontSize: 14, fontWeight: 600, color: "#a78bfa", cursor: "pointer" }}>
            🔑 Войти по коду друга
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "4px 0" }}>
            <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.08)" }} />
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.2)" }}>или</div>
            <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.08)" }} />
          </div>
          <button onClick={() => setPhase("playing")}
            style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: "14px", fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,0.4)", cursor: "pointer" }}>
            🤖 Соло с ботом
          </button>
        </div>
      </div>
    );
  }

  // ── GAMEOVER ──
  if (phase === "gameover") {
    const pw = pScore > bScore, draw = pScore === bScore;
    const pct = Math.round((pScore / 16) * 100);

    const winMsgs = ["Германия твоя! 🇩🇪", "Блестяще! Ни одной ошибки лишней!", "Ты настоящий знаток!", "Сильно сыграно — бот не справился!"];
    const loseMsgs = ["Не сдавайся — в следующий раз повезёт!", "Немного не хватило — практикуйся!", `${botName} сегодня был сильнее... но не всегда!`, "Учи слова и возвращайся за реваншем 💪"];
    const drawMsgs = ["Равные соперники!", "Ничья — как честно!", "Одинаково сильны — нужна пересдача!"];
    const msg = pw ? winMsgs[pScore % winMsgs.length] : draw ? drawMsgs[pScore % drawMsgs.length] : loseMsgs[bScore % loseMsgs.length];

    return (
      <div style={{ paddingTop: 50, textAlign: "center", animation: "fadeUp 0.4s ease" }}>
        <style>{ANIM_CSS}</style>
        {pw && <Confetti />}

        {/* Big result emoji with animation */}
        <div style={{ fontSize: 72, marginBottom: 8, animation: pw ? "pulse 1.2s ease infinite" : "none" }}>
          {pw ? "🏆" : draw ? "🤝" : "😢"}
        </div>

        <div style={{ fontSize: 26, fontWeight: 900, color: pw ? "#fcd34d" : draw ? "#a78bfa" : "rgba(255,255,255,0.5)", marginBottom: 6 }}>
          {pw ? "Победа!" : draw ? "Ничья!" : "Поражение"}
        </div>
        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", marginBottom: 28, lineHeight: 1.5, padding: "0 16px" }}>
          {msg}
        </div>

        {/* Score bar */}
        <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: 16, padding: "16px", marginBottom: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
            <div style={{ textAlign: "left" }}>
              <div style={{ fontSize: 11, color: "#a78bfa", fontWeight: 700 }}>ТЫ</div>
              <div style={{ fontSize: 32, fontWeight: 900, color: "#fff" }}>{pScore}</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>земель</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", fontSize: 18, color: "rgba(255,255,255,0.2)" }}>vs</div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 11, color: "#f59e0b", fontWeight: 700 }}>{botName.toUpperCase()}</div>
              <div style={{ fontSize: 32, fontWeight: 900, color: "#fff" }}>{bScore}</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>земель</div>
            </div>
          </div>
          {/* visual bar */}
          <div style={{ height: 8, borderRadius: 4, background: "rgba(245,158,11,0.4)", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${pct}%`, background: "linear-gradient(90deg,#7C5CFC,#a78bfa)", borderRadius: 4, transition: "width 1s ease" }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4, fontSize: 10, color: "rgba(255,255,255,0.25)" }}>
            <span>🟣 {pct}%</span><span>из 16 земель</span><span>{100-pct}% 🟡</span>
          </div>
        </div>

        <MapSvg compact />

        <div style={{ height: 20 }} />

        <button onClick={restartGame} style={{ width: "100%", background: pw ? "linear-gradient(135deg,#7C5CFC,#a78bfa)" : "#7C5CFC", color: "#fff", border: "none", borderRadius: 14, padding: "15px", fontSize: 15, fontWeight: 700, cursor: "pointer", marginBottom: 10 }}>
          {pw ? "Играть снова 🎉" : "Взять реванш 💪"}
        </button>
        <button onClick={onBack} style={{ width: "100%", background: "transparent", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.4)", borderRadius: 14, padding: "14px", fontSize: 15, cursor: "pointer" }}>В главное меню</button>
      </div>
    );
  }

  // ── SHARED MAP SVG ──
  function MapSvg({ compact }) {
    return (
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", borderRadius: 14, border: "1px solid rgba(255,255,255,0.06)", display: "block", background: "#13101f", flexShrink: 0, ...(compact ? { maxHeight: 200 } : {}) }}>
        {!geoFeatures && <text x={W/2} y={H/2} textAnchor="middle" fontSize="13" fill="rgba(255,255,255,0.3)">Загружаем карту...</text>}
        {geoFeatures && geoFeatures.map(feature => {
          const id = getStateId(feature);
          if (!id) return null;
          const d = featureToD(feature, W, H);
          const [cLon, cLat] = centroid(feature);
          const [cx, cy] = project(cLon, cLat, W, H);
          const isSmall = ["hh","hb","be","sl"].includes(id);
          const clickable = rPhase === "territory_select" && territories[id] !== "player";
          return (
            <g key={id} onClick={() => handleTerritoryClick(id)} style={{ cursor: clickable ? "pointer" : "default" }}>
              <path d={d} fill={getFill(id)} stroke={id === autoPickTerr ? "#ffffff" : getStroke(id)} strokeWidth={id === playerPick || id === botPick || id === autoPickTerr ? 2.5 : 1.2}
                strokeLinejoin="round" opacity={getOpacity(id)}
                style={{
                  transition: id === autoPickTerr ? "none" : "fill 0.5s ease, opacity 0.3s ease, stroke 0.3s ease",
                  ...(phase === "gameover" && territories[id] === "player" ? { animation: `winGlow ${0.8 + (id.charCodeAt(0) % 5) * 0.15}s ease-in-out infinite` } : {}),
                  ...(phase === "gameover" && territories[id] === "bot" ? { animation: `loseGlow ${0.9 + (id.charCodeAt(0) % 4) * 0.2}s ease-in-out infinite` } : {}),
                  ...getAutoPickStyle(id)
                }} />
              {!isSmall && <text x={cx} y={cy+2} textAnchor="middle" fontSize="6" fill="rgba(255,255,255,0.6)" style={{ pointerEvents:"none", userSelect:"none" }}>{id.toUpperCase()}</text>}
            </g>
          );
        })}
      </svg>
    );
  }

  // ── SHARED SCORE BAR ──
  const ScoreBar = () => (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
      <button onClick={onBack} style={{ background: "transparent", border: "none", color: "rgba(255,255,255,0.4)", fontSize: 22, cursor: "pointer", padding: 0 }}>←</button>
      <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 10, color: "#a78bfa", fontWeight: 700, letterSpacing: 1 }}>ТЫ</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: "#fff", lineHeight: 1 }}>{pScore}</div>
        </div>
        <div style={{ fontSize: 16, opacity: 0.4 }}>⚔️</div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 10, color: "#f59e0b", fontWeight: 700, letterSpacing: 1 }}>{botName.toUpperCase()}</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: "#fff", lineHeight: 1 }}>{bScore}</div>
        </div>
      </div>
      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.25)" }}>{pScore+bScore}/16</div>
    </div>
  );

  // ── ANSWER BUTTONS ──
  function AnswerButtons({ q, ans, onPick }) {
    if (!q) return null;
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {q.options.map((opt, i) => {
          let bg = "rgba(255,255,255,0.05)", border = "rgba(255,255,255,0.1)", color = "#fff";
          if (ans !== null) {
            if (i === q.correct) { bg = "rgba(16,185,129,0.18)"; border = "#10b981"; color = "#10b981"; }
            else if (i === ans) { bg = "rgba(239,68,68,0.18)"; border = "#ef4444"; color = "#ef4444"; }
            else color = "rgba(255,255,255,0.2)";
          }
          return (
            <button key={i} onClick={() => ans === null && onPick(i)}
              style={{ background: bg, border: `1px solid ${border}`, borderRadius: 12, padding: "12px 16px", color, fontSize: 14, cursor: ans !== null ? "default" : "pointer", textAlign: "left", display: "flex", justifyContent: "space-between", alignItems: "center", transition: "background 0.2s ease, border-color 0.2s ease, color 0.2s ease" }}>
              <span>{opt}</span>
              {ans !== null && i === q.correct && <span style={{ fontWeight: 800 }}>✓</span>}
              {ans !== null && i === ans && i !== q.correct && <span style={{ fontWeight: 800 }}>✗</span>}
            </button>
          );
        })}
      </div>
    );
  }

  // ── SELECTING (brief reveal) ──
  if (rPhase === "selecting") return (
    <div style={{ paddingTop: 16, animation: "fadeUp 0.3s ease" }}>
      <style>{ANIM_CSS}</style>
      <ScoreBar />
      <MapSvg />
      <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
        <div style={{ flex: 1, background: "rgba(124,92,252,0.12)", border: "1px solid rgba(124,92,252,0.3)", borderRadius: 12, padding: "10px 12px", animation: "flash 0.8s ease infinite" }}>
          <div style={{ fontSize: 10, color: "#a78bfa", fontWeight: 700, marginBottom: 2 }}>ТЫ АТАКУЕШЬ</div>
          <div style={{ fontSize: 13, color: "#fff", fontWeight: 600 }}>{stateName(playerPick)}</div>
        </div>
        <div style={{ flex: 1, background: isBattle ? "rgba(239,68,68,0.1)" : "rgba(245,158,11,0.1)", border: `1px solid ${isBattle ? "rgba(239,68,68,0.3)" : "rgba(245,158,11,0.3)"}`, borderRadius: 12, padding: "10px 12px", animation: "flash 0.8s ease 0.2s infinite" }}>
          <div style={{ fontSize: 10, color: isBattle ? "#f87171" : "#f59e0b", fontWeight: 700, marginBottom: 2 }}>{isBattle ? "ЗАЩИЩАЕТ" : `${botName.toUpperCase()} АТАКУЕТ`}</div>
          <div style={{ fontSize: 13, color: "#fff", fontWeight: 600 }}>{stateName(botPick)}</div>
        </div>
      </div>
      {isBattle && <div style={{ marginTop: 8, textAlign: "center", fontSize: 12, color: "#f87171", fontWeight: 700, letterSpacing: 1, animation: "pulse 0.6s ease infinite" }}>⚔️ НАЧИНАЕТСЯ БИТВА — ЛУЧШИЙ ИЗ 3!</div>}
      {isDuel && !isBattle && <div style={{ marginTop: 8, textAlign: "center", fontSize: 12, color: "#f87171", fontWeight: 700, letterSpacing: 1, animation: "pulse 0.6s ease infinite" }}>⚡ ДУЭЛЬ — ОБА ХОТЯТ ЭТУ ЗЕМЛЮ!</div>}
    </div>
  );

  // ── BATTLE ──
  if (rPhase === "battle") return (
    <div style={{ paddingTop: 16, animation: "fadeUp 0.3s ease" }}>
      <style>{ANIM_CSS}</style>
      {showConfetti && <Confetti />}
      <ScoreBar />
      <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: 14, padding: "10px 14px", marginBottom: 10 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 10, color: "#f87171", fontWeight: 700, letterSpacing: 1 }}>⚔️ БИТВА ЗА {stateName(playerPick).toUpperCase()}</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>Вопрос {battleRound + 1} из 3</div>
          </div>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 10, color: "#a78bfa" }}>ТЫ</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: "#fff" }}>{battleScore.player}</div>
            </div>
            <div style={{ fontSize: 14, color: "rgba(255,255,255,0.3)" }}>–</div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 10, color: "#f59e0b" }}>{botName.toUpperCase()}</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: "#fff" }}>{battleScore.bot}</div>
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 4, marginTop: 8 }}>
          {[0,1,2].map(i => <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i < battleRound ? "rgba(255,255,255,0.3)" : i === battleRound ? "#f87171" : "rgba(255,255,255,0.1)", transition: "background 0.4s ease" }} />)}
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 10, fontSize: 11 }}>
        {botDone
          ? <span style={{ color: botOk ? "#f59e0b" : "rgba(255,255,255,0.3)" }}>{botName}: {botOk ? "✓ правильно" : "✗ неправильно"}</span>
          : <span style={{ color: "rgba(255,255,255,0.3)", animation: "pulse 1s ease infinite" }}>{botName} отвечает...</span>}
      </div>
      <div style={{ fontSize: 17, fontWeight: 700, color: "#fff", marginBottom: 14 }}>{question?.word || question?.prompt}</div>
      <AnswerButtons q={question} ans={pAnswer} onPick={idx => { if (pAnsRef.current === null) { setPAnswer(idx); pAnsRef.current = idx; playSound(idx === qRef.current?.correct ? "correct" : "wrong"); } }} />
    </div>
  );

  // ── DUEL ──
  if (rPhase === "duel") return (
    <div style={{ paddingTop: 16, animation: "fadeUp 0.3s ease" }}>
      <style>{ANIM_CSS}</style>
      {showConfetti && <Confetti />}
      <ScoreBar />
      <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: 14, padding: "10px 14px", marginBottom: 10 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 10, color: "#f87171", fontWeight: 700, letterSpacing: 1 }}>⚡ ДУЭЛЬ ЗА {stateName(playerPick).toUpperCase()}</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>Ответь быстрее {botName}!</div>
          </div>
          <div style={{ fontSize: 28, fontWeight: 800, color: duelSecs <= 3 ? "#ef4444" : "#fff", transition: "color 0.3s", minWidth: 40, textAlign: "right" }}>{duelSecs}с</div>
        </div>
        <div style={{ height: 3, borderRadius: 2, background: "rgba(255,255,255,0.1)", marginTop: 8 }}>
          <div style={{ height: "100%", borderRadius: 2, background: duelSecs <= 3 ? "#ef4444" : "#7C5CFC", width: `${(duelSecs / 10) * 100}%`, transition: "width 1s linear, background 0.3s" }} />
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 10, fontSize: 11 }}>
        {botDone
          ? <span style={{ color: botOk ? "#f59e0b" : "rgba(255,255,255,0.3)" }}>{botName}: {botOk ? "✓ правильно" : "✗ неправильно"}</span>
          : <span style={{ color: "rgba(255,255,255,0.3)", animation: "pulse 1s ease infinite" }}>{botName} думает...</span>}
      </div>
      <div style={{ fontSize: 17, fontWeight: 700, color: "#fff", marginBottom: 14 }}>{question?.word || question?.prompt}</div>
      <AnswerButtons q={question} ans={pAnswer} onPick={handleDuelAnswer} />
    </div>
  );

  // ── TOPIC SELECT ──
  if (rPhase === "topic_select") {
    const myTurn = topicTurn === "player";
    const chosenCat = myTurn ? playerCat : botCat;
    return (
      <div style={{ paddingTop: 16, animation: "fadeUp 0.3s ease" }}>
        <style>{ANIM_CSS}</style>
        <ScoreBar />
        <div style={{ textAlign: "center", marginBottom: 16 }}>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginBottom: 4 }}>
            {myTurn ? "Твоя очередь выбрать тему" : `${botName} выбирает тему`}
          </div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.2)" }}>
            Оба ответите на один и тот же вопрос
          </div>
        </div>

        {myTurn ? (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {availableCats.map(cat => (
              <button key={cat} onClick={() => handleCategoryPick(cat)}
                style={{ background: "rgba(124,92,252,0.08)", border: "1px solid rgba(124,92,252,0.25)", borderRadius: 12, padding: "16px 10px", color: "#fff", fontSize: 13, cursor: "pointer", textAlign: "center", transition: "background 0.15s, border-color 0.15s" }}>
                <div style={{ fontSize: 26, marginBottom: 6 }}>{CAT_EMOJI[cat] || "📝"}</div>
                <div style={{ fontWeight: 600 }}>{cat}</div>
              </button>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: "center", paddingTop: 30 }}>
            <div style={{ fontSize: 32, marginBottom: 16, animation: "pulse 1s ease infinite" }}>🤔</div>
            <div style={{ fontSize: 14, color: "rgba(255,255,255,0.4)" }}>{botName} выбирает тему...</div>
          </div>
        )}
      </div>
    );
  }

  // ── ANSWERING ──
  if (rPhase === "answering") return (
    <div style={{ paddingTop: 16, animation: "fadeUp 0.3s ease" }}>
      <style>{ANIM_CSS}</style>
      {showConfetti && <Confetti />}
      <ScoreBar />
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <div style={{ flex: 1, background: "rgba(124,92,252,0.1)", border: "1px solid rgba(124,92,252,0.25)", borderRadius: 10, padding: "8px 10px", fontSize: 11 }}>
          <div style={{ color: "#a78bfa", fontWeight: 700 }}>ТЫ</div>
          <div style={{ color: "#fff" }}>🟣 {stateName(playerPick)}</div>
        </div>
        <div style={{ flex: 1, background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.25)", borderRadius: 10, padding: "8px 10px", fontSize: 11 }}>
          <div style={{ color: "#f59e0b", fontWeight: 700 }}>{botName.toUpperCase()}</div>
          <div style={{ color: "#fff" }}>🟡 {stateName(botPick)}</div>
          {botDone ? <div style={{ color: botOk ? "#10b981" : "#ef4444", fontSize: 10, marginTop: 2 }}>{botOk ? "✓ правильно" : "✗ неправильно"}</div>
            : <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 10, marginTop: 2, animation: "pulse 1s ease infinite" }}>думает...</div>}
        </div>
      </div>
      <div style={{ fontSize: 17, fontWeight: 700, color: "#fff", marginBottom: 14 }}>{question?.word || question?.prompt}</div>
      <AnswerButtons q={question} ans={pAnswer} onPick={idx => handleAnswer(idx)} />
    </div>
  );

  // ── ROUND RESULT ──
  if (rPhase === "round_result") return (
    <div style={{ paddingTop: 16, animation: "fadeUp 0.4s ease" }}>
      <style>{ANIM_CSS}</style>
      {showConfetti && <Confetti />}
      <ScoreBar />
      <MapSvg />
      <div style={{ marginTop: 10, padding: "14px 16px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14 }}>
        <div style={{ fontSize: 14, color: "#fff", marginBottom: 8, lineHeight: 1.6 }}>{roundMsg}</div>
        {isDuel && duelPlayerMs !== null && duelBotMs !== null && (
          <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
            <div style={{ flex: 1, background: "rgba(124,92,252,0.1)", borderRadius: 8, padding: "6px 10px", fontSize: 11, color: "#a78bfa" }}>
              Ты: {(duelPlayerMs / 1000).toFixed(1)}с
            </div>
            <div style={{ flex: 1, background: "rgba(245,158,11,0.1)", borderRadius: 8, padding: "6px 10px", fontSize: 11, color: "#f59e0b" }}>
              {botName}: {(duelBotMs / 1000).toFixed(1)}с
            </div>
          </div>
        )}
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.2)", textAlign: "center" }}>следующий раунд через секунду...</div>
      </div>
    </div>
  );

  // ── TERRITORY SELECT ──
  return (
    <div style={{ paddingTop: 16, animation: "fadeUp 0.3s ease" }}>
      <style>{ANIM_CSS}</style>
      <ScoreBar />
      <MapSvg />
      <div style={{ marginTop: 10, padding: "11px 16px", background: "rgba(124,92,252,0.07)", border: "1px solid rgba(124,92,252,0.18)", borderRadius: 12, fontSize: 13, color: "#a78bfa", textAlign: "center" }}>
        {botPick && botPickRevealed ? `🟡 ${botName} смотрит на ${stateName(botPick)} — выбери свою землю` : "👆 Выбери землю для захвата"}
      </div>
    </div>
  );
}

// ── MAIN APP ──────────────────────────────────────────────────
export default function DuoPar() {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [completedTopics, setCompletedTopics] = useState([]);
  const [screen, setScreen] = useState("lobby");
  const [questions, setQuestions] = useState([]);
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [score, setScore] = useState(0);
  const [partnerState, setPartnerState] = useState(null);
  const [showHint, setShowHint] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const [xpEarned, setXpEarned] = useState(0);
  const [animState, setAnimState] = useState(null); // "shake" | "pop"
  const [showConfetti, setShowConfetti] = useState(false);

  // Inject keyframe animations once
  useEffect(() => {
    const s = document.createElement("style");
    s.textContent = `
      @keyframes shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-10px)}40%{transform:translateX(10px)}60%{transform:translateX(-6px)}80%{transform:translateX(6px)}}
      @keyframes pop{0%{transform:scale(1)}40%{transform:scale(1.04)}100%{transform:scale(1)}}
      @keyframes streakPop{0%{transform:scale(1)}50%{transform:scale(1.3)}100%{transform:scale(1)}}
      .shake{animation:shake 0.4s ease}
      .pop{animation:pop 0.3s ease}
    `;
    document.head.appendChild(s);
    return () => document.head.removeChild(s);
  }, []);

  const isNewSignup = useRef(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_UP") isNewSignup.current = true;
      setSession(session);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session?.user) {
      supabase.from("profiles").select("*").eq("id", session.user.id).single()
        .then(({ data }) => {
          if (!data) return;
          if (!data.lang_level) {
            if (isNewSignup.current) {
              // Новый пользователь — показать онбординг
              setScreen("onboarding");
            } else {
              // Возвращающийся без уровня — поставить A1 по умолчанию
              supabase.from("profiles").update({ lang_level: "A1" }).eq("id", session.user.id);
              setProfile({ ...data, lang_level: "A1" });
              setScreen("lobby");
            }
          } else {
            setProfile(data);
            setCompletedTopics(data.completed_topics || []);
            setScreen("lobby");
          }
        });
    } else {
      setProfile(null);
    }
  }, [session]);

  const needsPlacement = screen === "onboarding";

  const q = questions[qIndex];
  const langLevel = profile?.lang_level || "A1";

  function completeTopic(topicId) {
    if (completedTopics.includes(topicId)) return;
    const updated = [...completedTopics, topicId];
    setCompletedTopics(updated);
    supabase.from("profiles").update({ completed_topics: updated }).eq("id", session.user.id);
  }

  function pickLevel(level) {
    setProfile(p => ({ ...p, lang_level: level }));
    setScreen("lobby");
    supabase.from("profiles").update({ lang_level: level }).eq("id", session.user.id);
  }

  function finishPlacement(level, testScore) {
    setProfile(p => ({ ...p, lang_level: level }));
    setScreen("placement_result_" + level + "_" + testScore);
    supabase.from("profiles").update({ lang_level: level }).eq("id", session.user.id);
  }

  async function retakeTest() {
    setScreen("placement");
  }

  function startGame(categories) {
    const pool = ALL_QUESTIONS.filter(q => q.level === langLevel && categories.includes(q.category));
    const fallback = pool.length < QUESTIONS_PER_ROUND ? ALL_QUESTIONS.filter(q => categories.includes(q.category)) : pool;
    setQuestions(shuffle(fallback).slice(0, QUESTIONS_PER_ROUND));
    setQIndex(0); setSelected(null); setRevealed(false);
    setScore(0); setPartnerState(null); setShowHint(false); setXpEarned(0);
    setScreen("quiz");
  }

  useEffect(() => {
    if (selected !== null && !revealed) {
      const isCorrect = selected === q.correct;
      playSound(isCorrect ? "correct" : "wrong");
      setAnimState(isCorrect ? "pop" : "shake");
      setTimeout(() => setAnimState(null), 450);

      const timer = setTimeout(() => {
        const partnerCorrect = Math.random() > 0.35;
        setPartnerState(partnerCorrect);
        setRevealed(true);
        if (isCorrect) {
          setXpEarned(prev => prev + (partnerCorrect ? 20 : 10));
          setScore(s => s + 1);
        }
      }, 800 + Math.random() * 1200);
      return () => clearTimeout(timer);
    }
  }, [selected]);

  useEffect(() => {
    if (revealed) {
      let c = 3; setCountdown(c);
      const iv = setInterval(() => {
        c -= 1;
        if (c <= 0) {
          clearInterval(iv); setCountdown(null);
          if (qIndex + 1 >= questions.length) setScreen("result");
          else { setQIndex(i => i + 1); setSelected(null); setRevealed(false); setPartnerState(null); setShowHint(false); }
        } else setCountdown(c);
      }, 1000);
      return () => clearInterval(iv);
    }
  }, [revealed]);

  useEffect(() => {
    if (screen === "result" && session?.user) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3500);

      const today = new Date().toISOString().split("T")[0];
      const last = profile?.last_played;
      const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
      const newStreak = last === today ? (profile?.streak || 1)
        : last === yesterday ? (profile?.streak || 0) + 1
        : 1;

      const newXP = (profile?.xp || 0) + xpEarned;
      const newRounds = (profile?.rounds_played || 0) + 1;
      supabase.from("profiles").update({ xp: newXP, rounds_played: newRounds, streak: newStreak, last_played: today }).eq("id", session.user.id)
        .then(() => setProfile(p => ({ ...p, xp: newXP, rounds_played: newRounds, streak: newStreak, last_played: today })));
    }
  }, [screen]);

  function getOptionStyle(i) {
    const base = { width: "100%", padding: "15px 18px", borderRadius: 14, border: "1.5px solid", fontSize: 15, fontWeight: 500, cursor: revealed ? "default" : "pointer", textAlign: "left", transition: "all 0.2s" };
    if (!revealed) return { ...base, background: selected === i ? "rgba(124,92,252,0.2)" : "rgba(255,255,255,0.04)", borderColor: selected === i ? "#7C5CFC" : "rgba(255,255,255,0.1)", color: "#fff" };
    if (i === q.correct) return { ...base, background: "rgba(16,185,129,0.15)", borderColor: "#10b981", color: "#10b981" };
    if (i === selected) return { ...base, background: "rgba(239,68,68,0.12)", borderColor: "#ef4444", color: "#ef4444" };
    return { ...base, background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.3)" };
  }

  const TYPE_LABEL = { translate: "Перевод", fill: "Артикли", choose: "Грамматика" };

  if (!session) return (
    <div style={{ minHeight: "100vh", background: "#0f0d1a", display: "flex", justifyContent: "center", fontFamily: "'Inter', system-ui, sans-serif" }}>
      <div style={{ width: "100%", maxWidth: 420, padding: "0 20px 40px" }}><AuthScreen /></div>
    </div>
  );

  // Ждём загрузку профиля
  if (!profile) return (
    <div style={{ minHeight: "100vh", background: "#0f0d1a", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.3)", fontFamily: "'Inter', system-ui, sans-serif" }}>
      Загрузка...
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#0f0d1a", display: "flex", justifyContent: "center", padding: "0 0 40px", fontFamily: "'Inter', system-ui, sans-serif" }}>
      <div style={{ width: "100%", maxWidth: 420, padding: "0 20px" }}>

        {/* LEVEL PICKER */}
        {screen === "onboarding" && (
          <LevelPicker onPick={pickLevel} onTest={() => setScreen("onboarding_test")} />
        )}

        {/* PLACEMENT TEST */}
        {(screen === "placement" || screen === "onboarding_test") && (
          <PlacementTest onDone={finishPlacement} />
        )}

        {/* PLACEMENT RESULT */}
        {screen.startsWith("placement_result_") && (() => {
          const parts = screen.split("_");
          const lvl = parts[2];
          const sc = parseInt(parts[3]);
          return <PlacementResult level={lvl} score={sc} onStart={() => setScreen("lobby")} />;
        })()}

        {/* PROFILE */}
        {screen === "profile" && !needsPlacement && (
          <ProfileScreen profile={profile} session={session} onUpdate={setProfile} onBack={() => setScreen("lobby")}
            onRetakeTest={retakeTest} />
        )}

        {/* LOBBY */}
        {screen === "lobby" && !needsPlacement && (
          <div style={{ paddingTop: 60 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
              <XPBar xp={profile?.xp || 0} username={profile?.username || (session?.user?.email ? session.user.email.split("@")[0] : "Игрок")} langLevel={profile?.lang_level} />
              <button onClick={() => setScreen("profile")} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, width: 40, height: 40, fontSize: 18, cursor: "pointer", marginLeft: 12, flexShrink: 0 }}>
                🧑‍💻
              </button>
            </div>

            <div style={{ marginBottom: 32 }}>
              <div style={{ fontSize: 11, letterSpacing: 3, color: "#7C5CFC", fontWeight: 600, marginBottom: 12, textTransform: "uppercase" }}>DuoPar · Deutsch</div>
              <h1 style={{ fontSize: 32, fontWeight: 800, color: "#fff", margin: 0, lineHeight: 1.2 }}>
                Учим немецкий<br /><span style={{ color: "#7C5CFC" }}>вместе</span>
              </h1>
              <div style={{ display: "flex", gap: 16, marginTop: 14 }}>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.35)" }}>
                  🎮 {profile?.rounds_played || 0} раундов
                </div>
                {(profile?.streak || 0) > 0 && (
                  <div style={{ fontSize: 13, color: "#f59e0b", fontWeight: 600 }}>
                    🔥 {profile.streak} {profile.streak === 1 ? "день" : profile.streak < 5 ? "дня" : "дней"} подряд
                  </div>
                )}
              </div>
            </div>

            <button onClick={() => setScreen("curriculum")} style={{ width: "100%", background: "linear-gradient(135deg, rgba(124,92,252,0.2), rgba(124,92,252,0.08))", color: "#fff", border: "1px solid rgba(124,92,252,0.35)", borderRadius: 20, padding: "20px", fontSize: 16, fontWeight: 700, cursor: "pointer", textAlign: "left", marginBottom: 10 }}>
              <div style={{ fontSize: 24, marginBottom: 6 }}>🎓</div>
              <div>Программа обучения</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", fontWeight: 400, marginTop: 4 }}>
                {completedTopics.length > 0
                  ? `${completedTopics.length} из ${CURRICULUM.filter(t => !t.linkedBonus).length} тем · продолжай учиться`
                  : "Слова, фразы, грамматика — шаг за шагом"}
              </div>
            </button>

            <button onClick={() => setScreen("mapgame")} style={{ width: "100%", background: "linear-gradient(135deg, rgba(245,158,11,0.15), rgba(245,158,11,0.06))", color: "#fff", border: "1px solid rgba(245,158,11,0.3)", borderRadius: 16, padding: "16px", fontSize: 15, fontWeight: 700, cursor: "pointer", textAlign: "left" }}>
              <div style={{ fontSize: 22, marginBottom: 4 }}>🗺️</div>
              <div>Тур по Германии</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", fontWeight: 400, marginTop: 4 }}>Игровой режим · путешествуй по 16 землям и применяй знания</div>
            </button>
          </div>
        )}

        {/* CURRICULUM */}
        {screen === "curriculum" && (
          <CurriculumScreen onBack={() => setScreen("lobby")} completedTopics={completedTopics} onTopicDone={completeTopic} userId={session?.user?.id} />
        )}

        {/* WORDS */}
        {screen === "words" && (
          <WordsScreen onBack={() => setScreen("lobby")} langLevel={profile?.lang_level} />
        )}

        {/* LEARN */}
        {screen === "learn" && <LearnScreen onBack={() => setScreen("lobby")} />}

        {/* MAP GAME */}
        {screen === "mapgame" && <MapGameScreen onBack={() => setScreen("lobby")} session={session} profile={profile} />}

        {/* SETUP */}
        {screen === "setup" && !needsPlacement && <SetupScreen langLevel={langLevel} onStart={startGame} onBack={() => setScreen("lobby")} />}

        {/* QUIZ */}
        {screen === "quiz" && q && (
          <div style={{ paddingTop: 40 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", fontWeight: 500 }}>{qIndex + 1} / {questions.length}</div>
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <span style={{ fontSize: 12, color: "#7C5CFC", fontWeight: 600 }}>⚡ {(profile?.xp || 0) + xpEarned} XP</span>
                <div style={{ fontSize: 11, background: "rgba(124,92,252,0.15)", color: "#7C5CFC", padding: "4px 10px", borderRadius: 20, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase" }}>{TYPE_LABEL[q.type]}</div>
              </div>
            </div>
            <ProgressBar current={qIndex} total={questions.length} />
            <PartnerBubble answered={selected !== null ? partnerState : null} isCorrect={partnerState} />
            <div style={{ margin: "28px 0 24px" }}>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginBottom: 10 }}>{q.prompt}</div>
              {q.word && <div style={{ fontSize: 30, fontWeight: 800, color: "#fff", lineHeight: 1.2 }}>{q.word}</div>}
            </div>
            <div className={animState || ""} style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
              {q.options.map((opt, i) => (
                <button key={i} onClick={() => !revealed && selected === null && setSelected(i)} style={getOptionStyle(i)}>
                  <span style={{ marginRight: 10, opacity: 0.4, fontSize: 13 }}>{["A", "B", "C", "D"][i]}</span>
                  {opt}
                  {revealed && i === q.correct && <span style={{ float: "right" }}>✓</span>}
                  {revealed && i === selected && selected !== q.correct && <span style={{ float: "right" }}>✗</span>}
                </button>
              ))}
            </div>
            {!revealed && (
              <button onClick={() => setShowHint(h => !h)} style={{ background: "transparent", border: "none", color: "rgba(255,255,255,0.3)", fontSize: 13, cursor: "pointer", padding: "4px 0", textDecoration: "underline", textUnderlineOffset: 3 }}>
                {showHint ? "Скрыть подсказку" : "Подсказка"}
              </button>
            )}
            {showHint && !revealed && (
              <div style={{ marginTop: 10, padding: "10px 14px", background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: 10, fontSize: 13, color: "#f59e0b" }}>
                💡 {q.hint}
              </div>
            )}
            {revealed && (
              <div style={{ marginTop: 16, padding: "12px 16px", background: selected === q.correct ? "rgba(16,185,129,0.08)" : "rgba(239,68,68,0.08)", border: `1px solid ${selected === q.correct ? "rgba(16,185,129,0.25)" : "rgba(239,68,68,0.2)"}`, borderRadius: 12, fontSize: 13, color: selected === q.correct ? "#10b981" : "#ef4444", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>{selected === q.correct ? "✓ Правильно!" : `✗ Верно: ${q.options[q.correct]}`}</span>
                {countdown !== null && <span style={{ opacity: 0.6, fontSize: 12 }}>далее через {countdown}...</span>}
              </div>
            )}
          </div>
        )}

        {/* RESULT */}
        {screen === "result" && (
          <div style={{ paddingTop: 60 }}>
            {showConfetti && <Confetti />}
            <ResultScreen score={score} total={questions.length} xpEarned={xpEarned} profile={profile}
              onRestart={() => setScreen("lobby")} onProfile={() => setScreen("profile")} />
          </div>
        )}
      </div>
    </div>
  );
}
