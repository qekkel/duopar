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

// ── ПРОГРАММА ОБУЧЕНИЯ ───────────────────────────────────────
const CURRICULUM_LEVELS = {
  A1: { color: "#7C5CFC", label: "A1 · Начинающий" },
  A2: { color: "#f59e0b", label: "A2 · Базовый" },
};

const CURRICULUM = [
  {
    id: "greetings",
    title: "Приветствия",
    emoji: "👋",
    level: "A1",
    cards: [
      { title: "Как поздороваться", body: "Hallo — Привет\nGuten Morgen — Доброе утро\nGuten Tag — Добрый день\nGuten Abend — Добрый вечер\nHi — Хай (неформально)" },
      { title: "Как попрощаться", body: "Tschüss — Пока\nAuf Wiedersehen — До свидания\nBis bald — До скорого\nBis morgen — До завтра\nGute Nacht — Спокойной ночи" },
      { title: "Как спросить «как дела»", body: "Wie geht es Ihnen? — Как вы поживаете? (официально)\nWie geht's? — Как дела? (неформально)\n\nОтветы:\nGut, danke! — Хорошо, спасибо!\nSehr gut! — Очень хорошо!\nEs geht. — Нормально.\nNicht so gut. — Не очень." },
    ],
    exam: [
      { q: "Как сказать «Добрый день» по-немецки?", options: ["Guten Tag", "Gute Nacht", "Auf Wiedersehen", "Tschüss"], answer: 0 },
      { q: "Что значит «Tschüss»?", options: ["Привет", "Пока", "Спасибо", "Пожалуйста"], answer: 1 },
      { q: "Как неформально спросить «как дела»?", options: ["Wie heißen Sie?", "Woher kommen Sie?", "Wie geht's?", "Was machen Sie?"], answer: 2 },
      { q: "«Bis bald» означает:", options: ["До завтра", "До свидания", "До скорого", "Спокойной ночи"], answer: 2 },
      { q: "Как ответить «Очень хорошо»?", options: ["Es geht.", "Nicht so gut.", "Danke schön.", "Sehr gut!"], answer: 3 },
    ],
  },
  {
    id: "articles",
    title: "Артикли",
    emoji: "📌",
    level: "A1",
    cards: [
      { title: "Три рода в немецком", body: "В немецком у каждого существительного есть род:\n\nder — мужской (der Mann, der Tisch)\ndie — женский (die Frau, die Tür)\ndas — средний (das Kind, das Buch)\n\n💡 Род надо учить вместе со словом — правил мало!" },
      { title: "Неопределённый артикль", body: "ein/eine — «один, одна» (как «a/an» в английском)\n\nein Mann — мужчина\neine Frau — женщина\nein Kind — ребёнок\n\n⚠️ Для мужского и среднего: ein\nДля женского: eine" },
      { title: "Когда артикль не нужен", body: "Артикль не ставится:\n\n• Перед именами: Das ist Anna.\n• Перед профессиями: Ich bin Lehrerin.\n• Перед странами: Ich komme aus Deutschland.\n\n💡 Исключение: die Schweiz, die Türkei — с артиклем!" },
    ],
    exam: [
      { q: "Какой артикль у слова «Tisch» (стол)?", options: ["die", "das", "der", "ein"], answer: 2 },
      { q: "Какой артикль у слова «Frau» (женщина)?", options: ["der", "die", "das", "einen"], answer: 1 },
      { q: "Какой артикль у слова «Kind» (ребёнок)?", options: ["der", "die", "das", "eine"], answer: 2 },
      { q: "«Eine Frau» — это:", options: ["Определённый артикль", "Неопределённый артикль", "Без артикля", "Притяжательный"], answer: 1 },
      { q: "Перед профессией артикль:", options: ["der", "die", "das", "не ставится"], answer: 3 },
    ],
  },
  {
    id: "numbers",
    title: "Числа 1–20",
    emoji: "🔢",
    level: "A1",
    cards: [
      { title: "Числа 1–10", body: "1 — eins\n2 — zwei\n3 — drei\n4 — vier\n5 — fünf\n6 — sechs\n7 — sieben\n8 — acht\n9 — neun\n10 — zehn" },
      { title: "Числа 11–20", body: "11 — elf\n12 — zwölf\n13 — dreizehn\n14 — vierzehn\n15 — fünfzehn\n16 — sechzehn\n17 — siebzehn\n18 — achtzehn\n19 — neunzehn\n20 — zwanzig\n\n💡 13-19: просто добавляй -zehn (= «-надцать»)" },
      { title: "Числа 21–100", body: "21 — einundzwanzig\n30 — dreißig\n40 — vierzig\n50 — fünfzig\n100 — hundert\n\n💡 В немецком порядок обратный:\n25 = fünfundzwanzig (пять-и-двадцать)\nКак старорусское «пять да двадцать»!" },
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
    id: "family",
    title: "Семья",
    emoji: "👨‍👩‍👧",
    level: "A1",
    cards: [
      { title: "Члены семьи", body: "der Vater — папа\ndie Mutter — мама\nder Bruder — брат\ndie Schwester — сестра\nder Sohn — сын\ndie Tochter — дочь\ndie Eltern — родители (мн.ч.)\ndie Kinder — дети (мн.ч.)" },
      { title: "Расширенная семья", body: "der Großvater / Opa — дедушка\ndie Großmutter / Oma — бабушка\nder Onkel — дядя\ndie Tante — тётя\nder Cousin — двоюродный брат\ndie Cousine — двоюродная сестра\nder Mann — муж\ndie Frau — жена" },
      { title: "Как рассказать о семье", body: "Ich habe... — У меня есть...\nIch habe einen Bruder. — У меня есть брат.\nIch habe keine Geschwister. — У меня нет братьев и сестёр.\n\nMeine Familie ist groß/klein.\nМоя семья большая/маленькая.\n\nGeschwister = братья и сёстры вместе" },
    ],
    exam: [
      { q: "Как по-немецки «дочь»?", options: ["der Sohn", "die Tochter", "die Schwester", "die Mutter"], answer: 1 },
      { q: "«Die Eltern» — это:", options: ["дети", "родители", "бабушки и дедушки", "тёти и дяди"], answer: 1 },
      { q: "Как сказать «У меня есть сестра»?", options: ["Ich bin eine Schwester.", "Ich habe eine Schwester.", "Ich habe einen Schwester.", "Mein Schwester."], answer: 1 },
      { q: "«Opa» — это разговорное слово для:", options: ["папы", "дяди", "дедушки", "брата"], answer: 2 },
      { q: "«Geschwister» значит:", options: ["сестра", "брат", "братья и сёстры", "родители"], answer: 2 },
    ],
  },
  {
    id: "colors",
    title: "Цвета",
    emoji: "🎨",
    level: "A1",
    cards: [
      { title: "Основные цвета", body: "rot — красный\nblau — синий\ngelb — жёлтый\ngrün — зелёный\nschwarz — чёрный\nweiß — белый\ngrau — серый\nbraun — коричневый\norange — оранжевый\nlila — фиолетовый\nrosa — розовый" },
      { title: "Как использовать цвета", body: "Das Auto ist rot. — Машина красная.\nIch mag Blau. — Мне нравится синий.\n\n💡 После глагола «sein» цвет не склоняется:\nDas Haus ist grün. ✓\n\nПеред существительным — склоняется:\nein rotes Haus (красный дом)\neine blaue Tür (синяя дверь)" },
    ],
    exam: [
      { q: "Как по-немецки «красный»?", options: ["blau", "grün", "rot", "gelb"], answer: 2 },
      { q: "«Schwarz» означает:", options: ["белый", "серый", "чёрный", "коричневый"], answer: 2 },
      { q: "Как сказать «Машина синяя»?", options: ["Das Auto ist blau.", "Das Auto ist blue.", "Das Auto bin blau.", "Das Auto hat blau."], answer: 0 },
      { q: "«Weiß» — это:", options: ["серый", "белый", "жёлтый", "розовый"], answer: 1 },
      { q: "«Grün» означает:", options: ["синий", "коричневый", "зелёный", "фиолетовый"], answer: 2 },
    ],
  },
  {
    id: "verbs_sein_haben",
    title: "Глаголы: sein и haben",
    emoji: "⚡",
    level: "A1",
    cards: [
      { title: "Глагол sein (быть)", body: "ich bin — я есть\ndu bist — ты есть\ner/sie/es ist — он/она/оно есть\nwir sind — мы есть\nihr seid — вы есть\nsie/Sie sind — они/Вы есть\n\nПримеры:\nIch bin müde. — Я устал.\nDu bist nett. — Ты приятный.\nSie ist Lehrerin. — Она учительница." },
      { title: "Глагол haben (иметь)", body: "ich habe — у меня есть\ndu hast — у тебя есть\ner/sie/es hat — у него/неё есть\nwir haben — у нас есть\nihr habt — у вас есть\nsie/Sie haben — у них/Вас есть\n\nПримеры:\nIch habe ein Auto. — У меня есть машина.\nEr hat Hunger. — Он голоден. (букв: у него есть голод)" },
      { title: "Sein vs Haben", body: "sein — описывает состояние или личность:\nIch bin glücklich. — Я счастлив.\nSie ist Ärztin. — Она врач.\n\nhaben — обозначает владение:\nIch habe Zeit. — У меня есть время.\nWir haben Hunger. — Мы голодны.\n\n💡 Hunger/Durst haben = быть голодным/жаждущим" },
    ],
    exam: [
      { q: "«Du ___ müde.» — вставь правильную форму sein:", options: ["bin", "bist", "ist", "sind"], answer: 1 },
      { q: "«Wir ___ ein Haus.» — вставь haben:", options: ["habe", "hast", "hat", "haben"], answer: 3 },
      { q: "«Er ___ Arzt.» — вставь sein:", options: ["bin", "bist", "ist", "sind"], answer: 2 },
      { q: "Как сказать «У неё есть кот»?", options: ["Sie ist einen Kater.", "Sie hat einen Kater.", "Sie haben einen Kater.", "Sie hast einen Kater."], answer: 1 },
      { q: "«Ich habe Hunger» буквально значит:", options: ["Я хочу есть", "У меня есть голод", "Мне нужна еда", "Я голодный человек"], answer: 1 },
    ],
  },
  {
    id: "word_order",
    title: "Порядок слов",
    emoji: "📐",
    level: "A1",
    cards: [
      { title: "Основной порядок слов", body: "В немецком предложении глагол ВСЕГДА стоит на 2-м месте:\n\nIch [1] trinke [2] Kaffee.\nHeute [1] trinke [2] ich Kaffee.\nKaffee [1] trinke [2] ich heute.\n\n💡 Что бы ни стояло на первом месте — глагол всегда второй!" },
      { title: "Вопросительные предложения", body: "Вопрос с вопросительным словом:\nWo wohnst du? — Где ты живёшь?\nWas machst du? — Что ты делаешь?\nWer bist du? — Кто ты?\n\nВопрос без вопр. слова (глагол на 1-м):\nKommst du? — Ты придёшь?\nHast du Zeit? — У тебя есть время?" },
      { title: "Отрицание", body: "nicht — отрицает глагол или прилагательное:\nIch schlafe nicht. — Я не сплю.\nDas ist nicht gut. — Это нехорошо.\n\nkein/keine — отрицает существительное:\nIch habe kein Auto. — У меня нет машины.\nIch habe keine Zeit. — У меня нет времени.\n\n💡 kein = ein + не; keine = eine + не" },
    ],
    exam: [
      { q: "Где в немецком предложении стоит глагол?", options: ["Всегда первый", "Всегда второй", "Всегда последний", "Где угодно"], answer: 1 },
      { q: "Выбери правильный порядок слов:", options: ["Ich heute trinke Tee.", "Heute ich trinke Tee.", "Heute trinke ich Tee.", "Trinke heute ich Tee."], answer: 2 },
      { q: "Как задать вопрос «У тебя есть время?»", options: ["Du hast Zeit?", "Hast du Zeit?", "Zeit du hast?", "Hast Zeit du?"], answer: 1 },
      { q: "«Ich habe ___ Auto» (у меня нет машины):", options: ["nicht", "keine", "kein", "nein"], answer: 2 },
      { q: "«Ich schlafe ___» (я не сплю):", options: ["kein", "keine", "nicht", "nein"], answer: 2 },
    ],
  },
  {
    id: "food",
    title: "Еда и напитки",
    emoji: "🍽️",
    level: "A1",
    cards: [
      { title: "Основные продукты", body: "das Brot — хлеб\ndie Milch — молоко\ndas Wasser — вода\nder Kaffee — кофе\nder Tee — чай\ndas Fleisch — мясо\nder Käse — сыр\ndas Ei — яйцо\ndas Gemüse — овощи\ndas Obst — фрукты" },
      { title: "В кафе и ресторане", body: "Ich möchte... — Я бы хотел...\nEin Kaffee, bitte! — Кофе, пожалуйста!\nDie Speisekarte, bitte. — Меню, пожалуйста.\nWas kostet das? — Сколько это стоит?\nDie Rechnung, bitte! — Счёт, пожалуйста!\nEs war sehr lecker! — Было очень вкусно!" },
    ],
    exam: [
      { q: "Как попросить счёт в ресторане?", options: ["Das Menü, bitte!", "Die Rechnung, bitte!", "Ich möchte essen.", "Was kostet das?"], answer: 1 },
      { q: "«Das Gemüse» — это:", options: ["фрукты", "мясо", "овощи", "хлеб"], answer: 2 },
      { q: "Как сказать «Я бы хотел кофе»?", options: ["Ich habe Kaffee.", "Ich bin Kaffee.", "Ich möchte Kaffee.", "Ich trinke Kaffee bitte."], answer: 2 },
      { q: "«Lecker» означает:", options: ["дорогой", "вкусный", "горячий", "холодный"], answer: 1 },
      { q: "«Das Ei» — это:", options: ["сыр", "молоко", "яйцо", "хлеб"], answer: 2 },
    ],
  },

  // ── A1 продолжение ────────────────────────────────────────────
  {
    id: "professions",
    title: "Профессии",
    emoji: "💼",
    level: "A1",
    cards: [
      { title: "Профессии", body: "der Arzt / die Ärztin — врач\nder Lehrer / die Lehrerin — учитель\nder Ingenieur — инженер\nder Koch / die Köchin — повар\nder Polizist — полицейский\ndie Krankenschwester — медсестра\nder Verkäufer — продавец\nder Student — студент" },
      { title: "Как говорить о профессии", body: "Ich bin Lehrerin. — Я учительница.\nEr ist Arzt. — Он врач.\nSie arbeitet als Köchin. — Она работает поваром.\n\n💡 Перед профессией НЕТ артикля:\nIch bin Arzt. ✓ (не «ein Arzt»)\n\nWas bist du von Beruf? — Кем ты работаешь?" },
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
    level: "A1",
    cards: [
      { title: "Дни недели", body: "der Montag — понедельник\nder Dienstag — вторник\nder Mittwoch — среда\nder Donnerstag — четверг\nder Freitag — пятница\nder Samstag — суббота\nder Sonntag — воскресенье" },
      { title: "Как использовать дни", body: "Am Montag — в понедельник\nAm Wochenende — на выходных\nMontagmorgen — утро понедельника\n\n💡 Все дни мужского рода: der\nСокращения: Mo Di Mi Do Fr Sa So\n\nHeute ist Mittwoch. — Сегодня среда." },
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
    level: "A1",
    cards: [
      { title: "Месяцы", body: "Januar — январь\nFebruar — февраль\nMärz — март\nApril — апрель\nMai — май\nJuni — июнь\nJuli — июль\nAugust — август\nSeptember — сентябрь\nOktober — октябрь\nNovember — ноябрь\nDezember — декабрь" },
      { title: "Времена года", body: "der Frühling — весна\nder Sommer — лето\nder Herbst — осень\nder Winter — зима\n\nim Sommer — летом\nim Winter — зимой\n\n💡 Im Januar = в январе\n(im = in dem, предлог + артикль)" },
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
    level: "A1",
    cards: [
      { title: "Как спросить время", body: "Wie viel Uhr ist es? — Который час?\nWie spät ist es? — Сколько времени?\n\nEs ist... — Сейчас...\nein Uhr — час\nzwei Uhr — два часа\ndrei Uhr — три часа\nzwölf Uhr — двенадцать часов" },
      { title: "Минуты и части дня", body: "Es ist halb drei. — Половина третьего (2:30)\nEs ist Viertel nach vier. — Четверть пятого (4:15)\nEs ist Viertel vor fünf. — Без четверти пять (4:45)\n\n💡 halb drei = половина ДО трёх = 2:30\nОтличается от русского!" },
    ],
    exam: [
      { q: "Как спросить «который час»?", options: ["Was ist die Zeit?", "Wie viel Uhr ist es?", "Wann ist es?", "Um wie Uhr?"], answer: 1 },
      { q: "«Es ist halb drei» — это:", options: ["3:00", "3:30", "2:30", "2:15"], answer: 2 },
      { q: "«Viertel nach vier» — это:", options: ["3:45", "4:15", "4:45", "5:15"], answer: 1 },
      { q: "«Es ist zwei Uhr» значит:", options: ["два часа", "второй час", "в два часа", "около двух"], answer: 0 },
      { q: "«Viertel vor fünf» — это:", options: ["5:15", "4:45", "5:45", "4:15"], answer: 1 },
    ],
  },
  {
    id: "clothes",
    title: "Одежда",
    emoji: "👕",
    level: "A1",
    cards: [
      { title: "Предметы одежды", body: "das T-Shirt — футболка\ndie Hose — брюки\ndas Kleid — платье\nder Rock — юбка\ndie Jacke — куртка\nder Mantel — пальто\ndie Schuhe — туфли / обувь\ndie Socken — носки\nder Hut — шляпа\ndie Mütze — шапка" },
      { title: "Покупка одежды", body: "Ich suche... — Я ищу...\nWelche Größe? — Какой размер?\nKann ich das anprobieren? — Можно примерить?\nDas passt gut! — Хорошо подходит!\nDas ist zu groß/klein. — Это слишком большое/маленькое.\nIch nehme es. — Я это возьму." },
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
    id: "health",
    title: "Тело и здоровье",
    emoji: "🏥",
    level: "A1",
    cards: [
      { title: "Части тела", body: "der Kopf — голова\ndas Auge — глаз\ndie Nase — нос\nder Mund — рот\ndas Ohr — ухо\nder Arm — рука (рука до плеча)\ndie Hand — рука (кисть)\ndas Bein — нога\nder Fuß — стопа\nder Bauch — живот\nder Rücken — спина" },
      { title: "У врача", body: "Ich bin krank. — Я болен.\nMir ist schlecht. — Мне плохо.\nIch habe Kopfschmerzen. — У меня болит голова.\nIch habe Fieber. — У меня температура.\nRufen Sie einen Arzt! — Вызовите врача!\n\n💡 _schmerzen = боль в...\nBauchschmerzen — боль в животе\nHalsschmerzen — боль в горле" },
    ],
    exam: [
      { q: "«Der Kopf» — это:", options: ["рука", "нога", "голова", "спина"], answer: 2 },
      { q: "«Ich habe Fieber» значит:", options: ["у меня насморк", "у меня температура", "я устал", "я голоден"], answer: 1 },
      { q: "«Mir ist schlecht» значит:", options: ["мне скучно", "мне плохо", "мне холодно", "мне жарко"], answer: 1 },
      { q: "«Halsschmerzen» — это боль в:", options: ["голове", "животе", "горле", "спине"], answer: 2 },
      { q: "«Das Bein» — это:", options: ["рука", "нога", "живот", "глаз"], answer: 1 },
    ],
  },
  {
    id: "shopping",
    title: "В магазине",
    emoji: "🛒",
    level: "A1",
    cards: [
      { title: "Покупки", body: "Was kostet das? — Сколько это стоит?\nWie viel kostet...? — Сколько стоит...?\nDas ist zu teuer. — Это слишком дорого.\nIch nehme das. — Я это возьму.\nHaben Sie...? — У вас есть...?\nWo ist die Kasse? — Где касса?\nEin Pfund — полкило (500г)" },
      { title: "Деньги и цены", body: "der Euro — евро\nder Cent — цент\nEs kostet 5 Euro. — Это стоит 5 евро.\nBezahlen Sie bar oder mit Karte?\nВы платите наличными или картой?\n\nbar — наличными\nmit Karte — картой\nDas Wechselgeld — сдача" },
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
    id: "transport",
    title: "Транспорт",
    emoji: "🚌",
    level: "A1",
    cards: [
      { title: "Виды транспорта", body: "der Bus — автобус\ndie U-Bahn — метро\ndie S-Bahn — электричка\nder Zug — поезд\ndas Auto — машина\ndas Fahrrad — велосипед\ndas Taxi — такси\ndas Flugzeug — самолёт\nzu Fuß — пешком" },
      { title: "На вокзале и остановке", body: "Wo fährt der Bus ab? — Откуда отходит автобус?\nEinen Fahrschein, bitte. — Один билет, пожалуйста.\nWann kommt der Zug an? — Когда прибывает поезд?\nEin Ticket nach Berlin. — Билет до Берлина.\nGleis 3 — третий путь (платформа)\numsteigen — делать пересадку" },
    ],
    exam: [
      { q: "«Die U-Bahn» — это:", options: ["автобус", "трамвай", "метро", "поезд"], answer: 2 },
      { q: "«Zu Fuß gehen» значит:", options: ["ехать на машине", "идти пешком", "ехать на велосипеде", "бежать"], answer: 1 },
      { q: "«Umsteigen» значит:", options: ["купить билет", "опоздать", "делать пересадку", "выйти из поезда"], answer: 2 },
      { q: "«Das Flugzeug» — это:", options: ["поезд", "корабль", "самолёт", "автобус"], answer: 2 },
      { q: "«Wann kommt der Zug an?» значит:", options: ["Откуда едет поезд?", "Когда прибывает поезд?", "Где поезд?", "Как долго едет поезд?"], answer: 1 },
    ],
  },
  {
    id: "hobbies",
    title: "Хобби и свободное время",
    emoji: "🎮",
    level: "A1",
    cards: [
      { title: "Хобби", body: "lesen — читать\nmusik hören — слушать музыку\nfernsehen — смотреть телевизор\nsport treiben — заниматься спортом\nkochen — готовить\nreisen — путешествовать\nzeichnen — рисовать\ntanzen — танцевать\nsingen — петь\nspielen — играть" },
      { title: "Как говорить о хобби", body: "Ich lese gern. — Я люблю читать.\nIch spiele gern Fußball. — Я люблю играть в футбол.\nIch mag Musik. — Мне нравится музыка.\n\n💡 gern = охотно, с удовольствием\nIch ... gern = Я люблю...\n\nWas machst du in der Freizeit?\nЧто ты делаешь в свободное время?" },
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
    level: "A1",
    cards: [
      { title: "können, müssen, wollen", body: "können — мочь, уметь\nIch kann schwimmen. — Я умею плавать.\n\nmüssen — должен, нужно\nIch muss arbeiten. — Мне нужно работать.\n\nwollen — хотеть\nIch will nach Berlin. — Я хочу в Берлин.\n\ndürfen — иметь право, разрешено\nDarf ich rauchen? — Можно курить?" },
      { title: "Формы модальных глаголов", body: "können: ich kann, du kannst, er/sie kann\nmüssen: ich muss, du musst, er/sie muss\nwollen: ich will, du willst, er/sie will\ndürfen: ich darf, du darfst, er/sie darf\n\n💡 Инфинитив идёт В КОНЕЦ предложения:\nIch kann heute nicht kommen.\nМне не удастся прийти сегодня." },
    ],
    exam: [
      { q: "«Ich kann Deutsch sprechen» значит:", options: ["Я хочу говорить по-немецки", "Я могу говорить по-немецки", "Я должен говорить по-немецки", "Я не говорю по-немецки"], answer: 1 },
      { q: "«Du ___ das Buch lesen» (должен) — вставь:", options: ["kannst", "willst", "musst", "darfst"], answer: 2 },
      { q: "Где стоит инфинитив с модальным глаголом?", options: ["В начале", "На втором месте", "В конце", "После подлежащего"], answer: 2 },
      { q: "«Darf ich...?» используют когда:", options: ["хотят что-то", "спрашивают разрешение", "описывают умение", "говорят об обязанности"], answer: 1 },
      { q: "«Ich will schlafen» значит:", options: ["Я должен спать", "Я умею спать", "Я хочу спать", "Я могу спать"], answer: 2 },
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
      { title: "Partizip II — как образовать", body: "Слабые глаголы:\nge- + основа + -(e)t\nmachen → gemacht\nkaufen → gekauft\narbeiten → gearbeitet\n\nСильные глаголы (меняют корень):\ngehen → gegangen\nessen → gegessen\nschreiben → geschrieben\nsehen → gesehen\n\n💡 Сильные глаголы надо учить наизусть!" },
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
    ],
    exam: [
      { q: "«Ich lerne Deutsch, ___ ich in Deutschland wohne.» (потому что)", options: ["wenn", "dass", "weil", "aber"], answer: 2 },
      { q: "Где в придаточном предложении стоит глагол?", options: ["На первом месте", "На втором месте", "В конце", "После союза"], answer: 2 },
      { q: "«Wenn» означает:", options: ["потому что", "что", "когда/если", "хотя"], answer: 2 },
      { q: "«Ich denke, ___ du recht hast.»", options: ["weil", "wenn", "dass", "ob"], answer: 2 },
      { q: "Что нужно поставить между главным и придаточным предложением?", options: ["точку", "запятую", "двоеточие", "ничего"], answer: 1 },
    ],
  },
];

function CurriculumScreen({ onBack, completedTopics, onTopicDone, userId }) {
  const STORAGE_KEY = `duopar_blocks_${userId || "guest"}`;

  const [activeTopicId, setActiveTopicId] = useState(null);
  const [mode, setMode] = useState(null); // "detail" | "block" | "exam"
  const [activeBlockIdx, setActiveBlockIdx] = useState(null);
  const [completedBlocks, setCompletedBlocks] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      const result = {};
      Object.keys(saved).forEach(k => { result[k] = new Set(saved[k]); });
      return result;
    } catch { return {}; }
  });

  function saveBlocks(updated) {
    const serializable = {};
    Object.keys(updated).forEach(k => { serializable[k] = [...updated[k]]; });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(serializable));
  }

  function doneBlocks(topicId) { return completedBlocks[topicId] || new Set(); }

  function getTopicBlocks(topic) {
    return topic.cards.map(card => ({
      name: card.title,
      words: (() => {
        const ws = [];
        card.body.split("\n").forEach(l => {
          if (l.includes(" — ") && !l.startsWith("💡") && !l.startsWith("⚠️") && !l.startsWith("•")) {
            const [de, ru] = l.split(" — ");
            if (de && ru) ws.push({ de: de.trim(), ru: ru.trim().replace(/\s*\(.*?\)/g, ""), section: card.title });
          }
        });
        return ws;
      })(),
    })).filter(b => b.words.length > 0);
  }

  if (activeTopicId && mode) {
    const topic = CURRICULUM.find(t => t.id === activeTopicId);
    const blocks = getTopicBlocks(topic);

    if (mode === "block" && activeBlockIdx !== null) {
      const block = blocks[activeBlockIdx];
      return <TopicBlockLearnScreen
        block={block}
        allWords={blocks.flatMap(b => b.words)}
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
      return <TopicExamScreen topic={topic} onBack={() => setMode("detail")} onPass={() => { onTopicDone(activeTopicId); setMode(null); setActiveTopicId(null); }} />;
    }

    if (mode === "detail") {
      const done = doneBlocks(activeTopicId);
      const allDone = blocks.length > 0 && done.size >= blocks.length;
      const nextBlock = blocks.findIndex((_, i) => !done.has(i));
      return (
        <div style={{ paddingTop: 60, textAlign: "center" }}>
          <button onClick={() => { setMode(null); setActiveTopicId(null); }} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", fontSize: 13, cursor: "pointer", marginBottom: 40, padding: 0, display: "block" }}>← Назад</button>
          <div style={{ fontSize: 56, marginBottom: 12 }}>{topic.emoji}</div>
          <div style={{ fontSize: 26, fontWeight: 800, color: "#fff", marginBottom: 6 }}>{topic.title}</div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", marginBottom: 36 }}>{done.size} из {blocks.length} частей пройдено</div>

          {/* Сегментированная полоска прогресса */}
          <div style={{ display: "flex", gap: 6, marginBottom: 48 }}>
            {blocks.map((_, i) => (
              <div key={i} style={{ flex: 1, height: 8, borderRadius: 4, background: done.has(i) ? "#7C5CFC" : "rgba(255,255,255,0.1)", transition: "background 0.4s" }} />
            ))}
          </div>

          {!allDone ? (
            <button onClick={() => { setActiveBlockIdx(nextBlock); setMode("block"); }} style={{ width: "100%", padding: "18px", borderRadius: 16, background: "#7C5CFC", border: "none", color: "#fff", fontSize: 16, fontWeight: 700, cursor: "pointer" }}>
              {done.size === 0 ? "▶ Начать" : "▶ Продолжить"}
            </button>
          ) : (
            <button onClick={() => setMode("exam")} style={{ width: "100%", padding: "18px", borderRadius: 16, background: "linear-gradient(135deg, #7C5CFC, #a78bfa)", border: "none", color: "#fff", fontSize: 16, fontWeight: 700, cursor: "pointer" }}>
              ⚡ Сдать экзамен
            </button>
          )}
          {done.size > 0 && !allDone && (
            <button onClick={() => { setActiveBlockIdx(0); setCompletedBlocks(p => ({ ...p, [activeTopicId]: new Set() })); setMode("block"); }} style={{ marginTop: 12, background: "none", border: "none", color: "rgba(255,255,255,0.25)", fontSize: 13, cursor: "pointer" }}>
              Начать сначала
            </button>
          )}
        </div>
      );
    }
  }

  return (
    <div style={{ paddingTop: 40 }}>
      <button onClick={onBack} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", fontSize: 13, cursor: "pointer", marginBottom: 20, padding: 0 }}>← Назад</button>
      <h1 style={{ fontSize: 26, fontWeight: 800, color: "#fff", margin: "0 0 4px" }}>Программа</h1>
      <div style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", marginBottom: 24 }}>{completedTopics.length} из {CURRICULUM.length} тем пройдено</div>

      {["A1", "A2"].map(lvl => {
        const topics = CURRICULUM.filter(t => t.level === lvl);
        const lvlColor = CURRICULUM_LEVELS[lvl].color;
        return (
          <div key={lvl} style={{ marginBottom: 32 }}>
            <div style={{ fontSize: 12, color: lvlColor, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", marginBottom: 12 }}>{CURRICULUM_LEVELS[lvl].label}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {topics.map((topic) => {
                const i = CURRICULUM.indexOf(topic);
                const examDone = completedTopics.includes(topic.id);
                const blocks = getTopicBlocks(topic);
                const done = doneBlocks(topic.id);
                const blocksTotal = blocks.length;
                const blocksDone = done.size;
                const inProgress = blocksDone > 0 && !examDone;
                return (
                  <button key={topic.id} onClick={() => { setActiveTopicId(topic.id); setMode("detail"); }}
                    style={{ background: examDone ? "rgba(16,185,129,0.08)" : inProgress ? "rgba(124,92,252,0.08)" : "rgba(255,255,255,0.04)", border: `1px solid ${examDone ? "rgba(16,185,129,0.3)" : inProgress ? "rgba(124,92,252,0.3)" : "rgba(255,255,255,0.1)"}`, borderRadius: 18, padding: "16px 18px", textAlign: "left", cursor: "pointer", width: "100%" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: blocksTotal > 0 ? 10 : 0 }}>
                      <div style={{ fontSize: 26 }}>{examDone ? "✅" : topic.emoji}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>{i + 1}. {topic.title}</div>
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
            </div>
          </div>
        );
      })}
    </div>
  );
}

function parseFlashcards(topic) {
  const cards = [];
  topic.cards.forEach(card => {
    const lines = card.body.split("\n").filter(l => l.includes(" — ") && !l.startsWith("💡") && !l.startsWith("⚠️") && !l.startsWith("•"));
    lines.forEach(line => {
      const [de, ru] = line.split(" — ");
      if (de && ru) cards.push({ de: de.trim(), ru: ru.trim().replace(/\s*\(.*?\)/g, ""), section: card.title });
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

        <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 24, padding: "44px 28px", textAlign: "center", marginBottom: 16 }}>
          <div style={{ fontSize: 44, fontWeight: 900, color: "#fff", marginBottom: 22 }}>{card.de}</div>
          <div style={{ width: 32, height: 2, background: "rgba(255,255,255,0.12)", margin: "0 auto 22px" }} />
          <div style={{ fontSize: 28, fontWeight: 700, color: "#a78bfa" }}>{card.ru}</div>
        </div>

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
  const options = card ? shuffle([correct, ...shuffle(allCards.filter(f => f.ru !== correct)).slice(0, 3).map(f => f.ru)]) : [];

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
        <div style={{ fontSize: 40, fontWeight: 900, color: "#fff" }}>{card.de}</div>
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
          return <button key={i} onClick={() => pick(opt)} style={{ padding: "16px 18px", borderRadius: 14, background: bg, border: `1px solid ${border}`, color, fontSize: 15, textAlign: "left", cursor: selected !== null ? "default" : "pointer", fontWeight: 600, transition: "all 0.2s", display: "flex", justifyContent: "space-between", alignItems: "center" }}><span>{opt}</span>{icon && <span style={{ fontSize: 18, fontWeight: 800 }}>{icon}</span>}</button>;
        })}
      </div>
    </div>
  );
}

function TopicBlockLearnScreen({ block, allWords, onBack, onDone }) {
  const words = block.words;
  const [phase, setPhase] = useState("intro");
  const [introIdx, setIntroIdx] = useState(0);
  const [practiceQueue, setPracticeQueue] = useState(() => shuffle(words));
  const [practiceIdx, setPracticeIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [wrong, setWrong] = useState([]);
  const [retryWords, setRetryWords] = useState([]);

  function startPractice() { setPracticeQueue(shuffle(words)); setPracticeIdx(0); setSelected(null); setWrong([]); setPhase("practice"); }

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
        if (retry.length > 0) { setRetryWords(retry); setPhase("retry_intro"); }
        else onDone();
      }
    }, 900);
  }

  const progress = phase === "intro" ? (introIdx + 1) / words.length / 2 : 0.5 + (practiceIdx + 1) / practiceQueue.length / 2;

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
        <div style={{ fontSize: 11, color: "#a78bfa", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 }}>📚 {block.name}</div>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.25)", marginBottom: 20 }}>Слово {introIdx + 1} из {words.length} · Запомни</div>
        <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 24, padding: "44px 28px", textAlign: "center", marginBottom: 16 }}>
          <div style={{ fontSize: 44, fontWeight: 900, color: "#fff", marginBottom: 22 }}>{card.de}</div>
          <div style={{ width: 32, height: 2, background: "rgba(255,255,255,0.12)", margin: "0 auto 22px" }} />
          <div style={{ fontSize: 28, fontWeight: 700, color: "#a78bfa" }}>{card.ru}</div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          {introIdx > 0 && <button onClick={() => setIntroIdx(i => i - 1)} style={{ flex: 1, padding: "14px", borderRadius: 14, background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.4)", border: "1px solid rgba(255,255,255,0.08)", fontSize: 14, cursor: "pointer" }}>←</button>}
          {!isLast
            ? <button onClick={() => setIntroIdx(i => i + 1)} style={{ flex: 3, padding: "14px", borderRadius: 14, background: "#7C5CFC", color: "#fff", border: "none", fontSize: 15, fontWeight: 700, cursor: "pointer" }}>Следующее →</button>
            : <button onClick={startPractice} style={{ flex: 3, padding: "14px", borderRadius: 14, background: "linear-gradient(135deg,#7C5CFC,#a78bfa)", color: "#fff", border: "none", fontSize: 15, fontWeight: 700, cursor: "pointer" }}>🎯 Проверить себя!</button>}
        </div>
      </div>
    );
  }

  const card = practiceQueue[practiceIdx];
  const correct = card?.ru;
  const options = card ? shuffle([correct, ...shuffle(allWords.filter(f => f.ru !== correct)).slice(0, 3).map(f => f.ru)]) : [];
  return (
    <div style={{ paddingTop: 40 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <button onClick={onBack} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", fontSize: 13, cursor: "pointer", padding: 0, flexShrink: 0 }}>← Назад</button>
        <div style={{ flex: 1, height: 4, background: "rgba(255,255,255,0.08)", borderRadius: 2 }}>
          <div style={{ height: "100%", borderRadius: 2, background: "#7C5CFC", width: `${progress * 100}%`, transition: "width 0.4s" }} />
        </div>
      </div>
      <div style={{ fontSize: 11, color: "#7C5CFC", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 }}>🎯 {block.name}</div>
      <div style={{ fontSize: 12, color: "rgba(255,255,255,0.25)", marginBottom: 20 }}>Угадай · {practiceIdx + 1} из {practiceQueue.length}</div>
      <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 20, padding: "36px 24px", textAlign: "center", marginBottom: 20 }}>
        <div style={{ fontSize: 40, fontWeight: 900, color: "#fff" }}>{card.de}</div>
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
          return <button key={i} onClick={() => pick(opt)} style={{ padding: "16px 18px", borderRadius: 14, background: bg, border: `1px solid ${border}`, color, fontSize: 15, textAlign: "left", cursor: selected !== null ? "default" : "pointer", fontWeight: 600, transition: "all 0.2s", display: "flex", justifyContent: "space-between", alignItems: "center" }}><span>{opt}</span>{icon && <span style={{ fontSize: 18, fontWeight: 800 }}>{icon}</span>}</button>;
        })}
      </div>
    </div>
  );
}

function buildExamQuestions(topic) {
  const flashcards = parseFlashcards(topic);
  // mix flashcard words + hardcoded exam questions, deduplicate
  const wordQuestions = shuffle(flashcards).slice(0, 6).map(card => ({
    q: `Как переводится «${card.de}»?`,
    options: shuffle([card.ru, ...shuffle(flashcards.filter(f => f.ru !== card.ru)).slice(0, 3).map(f => f.ru)]),
    answer: null,
    correctText: card.ru,
  }));
  const hardcoded = shuffle(topic.exam).slice(0, 4).map(q => ({ ...q, correctText: null }));
  return shuffle([...wordQuestions, ...hardcoded]).slice(0, 8);
}

function TopicExamScreen({ topic, onBack, onPass }) {
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
    return (
      <div style={{ paddingTop: 60, textAlign: "center" }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>{passed ? "🎉" : "😅"}</div>
        <div style={{ fontSize: 24, fontWeight: 800, color: "#fff", marginBottom: 8 }}>{passed ? "Тема пройдена!" : "Попробуй ещё раз"}</div>
        <div style={{ fontSize: 15, color: "rgba(255,255,255,0.5)", marginBottom: 32 }}>{score} из {total} правильно · нужно {passMark}+</div>
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

            <button onClick={() => setScreen("curriculum")} style={{ width: "100%", background: "linear-gradient(135deg, rgba(124,92,252,0.2), rgba(124,92,252,0.08))", color: "#fff", border: "1px solid rgba(124,92,252,0.35)", borderRadius: 20, padding: "20px", fontSize: 16, fontWeight: 700, cursor: "pointer", textAlign: "left", marginBottom: 10 }}>
              <div style={{ fontSize: 24, marginBottom: 6 }}>🎓</div>
              <div>Программа обучения</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", fontWeight: 400, marginTop: 4 }}>{completedTopics.length} из {CURRICULUM.length} тем пройдено</div>
            </button>

            <button onClick={() => setScreen("setup")} style={{ width: "100%", background: "#7C5CFC", color: "#fff", border: "none", borderRadius: 16, padding: "16px", fontSize: 15, fontWeight: 700, cursor: "pointer" }}>
              🎮 Играть →
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
