import { useState, useEffect, useRef } from "react";
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
  A1: { label: "A1 · Элементарный", color: "#7C5CFC", desc: "Простая лексика и артикли" },
  A2: { label: "A2 · Базовый", color: "#f59e0b", desc: "Грамматика и падежи" },
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
        body: "         m      f      n\nNom:   der    die    das\nAkk:   den    die    das\nDat:   dem    der    dem\n\n💡 Запомни: в Akkusativ меняется только мужской род: der → den.",
        mono: true,
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
          <div style={{ fontSize: 14, color: "rgba(255,255,255,0.7)", lineHeight: 1.8, whiteSpace: "pre-line", fontFamily: card.mono ? "monospace" : "inherit" }}>
            {card.body}
          </div>
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
    { id: "A1", icon: "📖", title: "A1 · Элементарный", desc: "Знаю базовые слова и фразы" },
    { id: "A2", icon: "💬", title: "A2 · Базовый", desc: "Понимаю простые предложения" },
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
    const newScore = score + (i === q.correct ? 1 : 0);
    setTimeout(() => {
      if (isLast) {
        onDone(LEVEL_FROM_SCORE(newScore), newScore);
      } else {
        setQIndex(idx => idx + 1);
        setSelected(null);
        setRevealed(false);
      }
      if (i === q.correct) setScore(newScore);
    }, 900);
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
        if (username && data.user) await supabase.from("profiles").update({ username }).eq("id", data.user.id);
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
function SetupScreen({ langLevel, onStart }) {
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
    <div style={{ paddingTop: 60 }}>
      <div style={{ fontSize: 11, letterSpacing: 3, color: "#7C5CFC", fontWeight: 600, marginBottom: 12, textTransform: "uppercase" }}>DuoPar · {langLevel}</div>
      <h1 style={{ fontSize: 28, fontWeight: 800, color: "#fff", margin: "0 0 6px" }}>Выбери темы</h1>
      <div style={{ fontSize: 14, color: "rgba(255,255,255,0.35)", marginBottom: 28 }}>Доступны для уровня {langLevel}</div>
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

// ── MAIN APP ──────────────────────────────────────────────────
export default function DuoPar() {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
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

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => setSession(session));
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session?.user) {
      supabase.from("profiles").select("*").eq("id", session.user.id).single()
        .then(({ data }) => {
          setProfile(data);
          if (data && !data.lang_level) setScreen("onboarding");
        });
    } else {
      setProfile(null);
    }
  }, [session]);

  const needsPlacement = screen === "onboarding";

  const q = questions[qIndex];
  const langLevel = profile?.lang_level || "A1";

  async function pickLevel(level) {
    const { error } = await supabase.from("profiles").update({ lang_level: level }).eq("id", session.user.id);
    if (!error) {
      setProfile(p => ({ ...p, lang_level: level }));
      setScreen("lobby");
    }
  }

  async function finishPlacement(level, testScore) {
    await supabase.from("profiles").update({ lang_level: level }).eq("id", session.user.id);
    setProfile(p => ({ ...p, lang_level: level }));
    setScreen("placement_result_" + level + "_" + testScore);
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
              <XPBar xp={profile?.xp || 0} username={profile?.username} langLevel={profile?.lang_level} />
              <button onClick={() => setScreen("profile")} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, width: 40, height: 40, fontSize: 18, cursor: "pointer", marginLeft: 12, flexShrink: 0 }}>
                🧑‍💻
              </button>
            </div>

            <div style={{ marginBottom: 32 }}>
              <div style={{ fontSize: 11, letterSpacing: 3, color: "#7C5CFC", fontWeight: 600, marginBottom: 12, textTransform: "uppercase" }}>DuoPar · Deutsch</div>
              <h1 style={{ fontSize: 32, fontWeight: 800, color: "#fff", margin: 0, lineHeight: 1.2 }}>
                Учи немецкий<br /><span style={{ color: "#7C5CFC" }}>вместе</span>
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

            <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 20, padding: 20, marginBottom: 24 }}>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 14, fontWeight: 500 }}>ПАРТНЁР НАЙДЕН</div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 48, height: 48, borderRadius: 14, fontSize: 24, background: "rgba(124,92,252,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>{PARTNER.avatar}</div>
                <div>
                  <div style={{ fontWeight: 700, color: "#fff", fontSize: 16 }}>{PARTNER.name}</div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>Уровень {PARTNER.level} · онлайн сейчас</div>
                </div>
                <div style={{ marginLeft: "auto", width: 10, height: 10, borderRadius: "50%", background: "#10b981", boxShadow: "0 0 8px #10b981" }} />
              </div>
            </div>

            <div style={{ display: "flex", gap: 10, marginBottom: 0 }}>
              <button onClick={() => setScreen("learn")} style={{ flex: 1, background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.7)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 16, padding: "16px", fontSize: 15, fontWeight: 600, cursor: "pointer" }}>
                📖 Учить
              </button>
              <button onClick={() => setScreen("setup")} style={{ flex: 2, background: "#7C5CFC", color: "#fff", border: "none", borderRadius: 16, padding: "16px", fontSize: 15, fontWeight: 700, cursor: "pointer" }}>
                Играть →
              </button>
            </div>
          </div>
        )}

        {/* LEARN */}
        {screen === "learn" && <LearnScreen onBack={() => setScreen("lobby")} />}

        {/* SETUP */}
        {screen === "setup" && !needsPlacement && <SetupScreen langLevel={langLevel} onStart={startGame} />}

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
