import { useState, useEffect } from "react";
import { supabase } from "./supabase";

const ALL_QUESTIONS = [
  { id: 1, type: "translate", category: "Природа", prompt: "Как переводится слово?", word: "die Brücke", options: ["Мост", "Река", "Дорога", "Берег"], correct: 0, hint: "По ней переходят через реку" },
  { id: 2, type: "translate", category: "Природа", prompt: "Как переводится слово?", word: "die Wolke", options: ["Вода", "Облако", "Ветер", "Земля"], correct: 1, hint: "Бывает на небе" },
  { id: 3, type: "translate", category: "Природа", prompt: "Как переводится слово?", word: "der Schmetterling", options: ["Жук", "Бабочка", "Стрекоза", "Пчела"], correct: 1, hint: "Летает среди цветов" },
  { id: 4, type: "translate", category: "Природа", prompt: "Как переводится слово?", word: "der Wald", options: ["Поле", "Лес", "Гора", "Озеро"], correct: 1, hint: "Много деревьев" },
  { id: 5, type: "translate", category: "Природа", prompt: "Как переводится слово?", word: "der Regen", options: ["Снег", "Туман", "Дождь", "Ветер"], correct: 2, hint: "Капает с неба" },
  { id: 6, type: "translate", category: "Природа", prompt: "Как переводится слово?", word: "die Blume", options: ["Дерево", "Трава", "Куст", "Цветок"], correct: 3, hint: "Растёт в саду, пахнет красиво" },
  { id: 7, type: "translate", category: "Природа", prompt: "Как переводится слово?", word: "der Schnee", options: ["Лёд", "Снег", "Град", "Иней"], correct: 1, hint: "Белый и холодный" },
  { id: 8, type: "translate", category: "Природа", prompt: "Как переводится слово?", word: "der Fluss", options: ["Море", "Река", "Озеро", "Ручей"], correct: 1, hint: "Течёт между берегами" },
  { id: 9, type: "translate", category: "Еда", prompt: "Как переводится слово?", word: "der Kuchen", options: ["Хлеб", "Пирог", "Суп", "Сыр"], correct: 1, hint: "Сладкое, часто к кофе" },
  { id: 10, type: "translate", category: "Еда", prompt: "Как переводится слово?", word: "das Brot", options: ["Булочка", "Пирог", "Хлеб", "Печенье"], correct: 2, hint: "Основа немецкого стола" },
  { id: 11, type: "translate", category: "Еда", prompt: "Как переводится слово?", word: "die Kartoffel", options: ["Морковь", "Лук", "Картофель", "Капуста"], correct: 2, hint: "Из неё делают картошку-фри" },
  { id: 12, type: "translate", category: "Еда", prompt: "Как переводится слово?", word: "der Käse", options: ["Масло", "Молоко", "Творог", "Сыр"], correct: 3, hint: "Делают из молока, бывает с дырками" },
  { id: 13, type: "translate", category: "Еда", prompt: "Как переводится слово?", word: "das Ei", options: ["Молоко", "Яйцо", "Мясо", "Рыба"], correct: 1, hint: "Кладут в омлет" },
  { id: 14, type: "translate", category: "Еда", prompt: "Как переводится слово?", word: "der Apfel", options: ["Груша", "Слива", "Яблоко", "Вишня"], correct: 2, hint: "Красный или зелёный фрукт" },
  { id: 15, type: "translate", category: "Город", prompt: "Как переводится слово?", word: "der Bahnhof", options: ["Аэропорт", "Вокзал", "Порт", "Стоянка"], correct: 1, hint: "Bahn — поезд, Hof — двор" },
  { id: 16, type: "translate", category: "Город", prompt: "Как переводится слово?", word: "die Straße", options: ["Площадь", "Переулок", "Улица", "Проспект"], correct: 2, hint: "По ней едут машины" },
  { id: 17, type: "translate", category: "Город", prompt: "Как переводится слово?", word: "das Krankenhaus", options: ["Школа", "Больница", "Аптека", "Банк"], correct: 1, hint: "Krank — больной, Haus — дом" },
  { id: 18, type: "translate", category: "Город", prompt: "Как переводится слово?", word: "die Bibliothek", options: ["Музей", "Театр", "Библиотека", "Галерея"], correct: 2, hint: "Там берут книги" },
  { id: 19, type: "translate", category: "Город", prompt: "Как переводится слово?", word: "das Rathaus", options: ["Тюрьма", "Ратуша", "Церковь", "Замок"], correct: 1, hint: "Центр городского управления" },
  { id: 20, type: "translate", category: "Дом", prompt: "Как переводится слово?", word: "der Kühlschrank", options: ["Плита", "Холодильник", "Шкаф", "Раковина"], correct: 1, hint: "kühl — прохладный" },
  { id: 21, type: "translate", category: "Дом", prompt: "Как переводится слово?", word: "das Fenster", options: ["Дверь", "Стена", "Окно", "Потолок"], correct: 2, hint: "Через него светит солнце" },
  { id: 22, type: "translate", category: "Дом", prompt: "Как переводится слово?", word: "das Schloss", options: ["Ключ", "Дверь", "Замок", "Окно"], correct: 2, hint: "Может быть и дворцом, и замком на двери" },
  { id: 23, type: "translate", category: "Дом", prompt: "Как переводится слово?", word: "der Stuhl", options: ["Стол", "Кровать", "Диван", "Стул"], correct: 3, hint: "На нём сидят" },
  { id: 24, type: "translate", category: "Дом", prompt: "Как переводится слово?", word: "die Treppe", options: ["Лифт", "Лестница", "Коридор", "Балкон"], correct: 1, hint: "По ней поднимаются на этаж" },
  { id: 25, type: "translate", category: "Чувства", prompt: "Как переводится слово?", word: "die Sehnsucht", options: ["Радость", "Скука", "Тоска", "Злость"], correct: 2, hint: "Глубокое тоскливое желание" },
  { id: 26, type: "translate", category: "Чувства", prompt: "Как переводится слово?", word: "die Freude", options: ["Грусть", "Страх", "Радость", "Злость"], correct: 2, hint: "Когда всё хорошо" },
  { id: 27, type: "translate", category: "Чувства", prompt: "Как переводится слово?", word: "die Angst", options: ["Боль", "Страх", "Усталость", "Скука"], correct: 1, hint: "Неприятное чувство перед опасностью" },
  { id: 28, type: "translate", category: "Чувства", prompt: "Как переводится слово?", word: "das Jahrhundert", options: ["Год", "Десятилетие", "Век", "Момент"], correct: 2, hint: "100 лет" },
  { id: 29, type: "translate", category: "Чувства", prompt: "Как переводится слово?", word: "die Zukunft", options: ["Прошлое", "Настоящее", "Будущее", "История"], correct: 2, hint: "То, что ещё не случилось" },
  { id: 30, type: "translate", category: "Чувства", prompt: "Как переводится слово?", word: "gestern", options: ["Сегодня", "Завтра", "Вчера", "Недавно"], correct: 2, hint: "День до сегодняшнего" },
  { id: 31, type: "fill", category: "Грамматика", prompt: "Выбери правильный артикль:", word: "___ Hund bellt laut.", options: ["Der", "Die", "Das", "Dem"], correct: 0, hint: "Hund — мужской род" },
  { id: 32, type: "fill", category: "Грамматика", prompt: "Выбери правильный артикль:", word: "___ Sonne scheint.", options: ["Der", "Die", "Das", "Den"], correct: 1, hint: "Sonne — женский род" },
  { id: 33, type: "fill", category: "Грамматика", prompt: "Выбери правильный артикль:", word: "___ Kind spielt.", options: ["Der", "Die", "Das", "Dem"], correct: 2, hint: "Kind — средний род" },
  { id: 34, type: "fill", category: "Грамматика", prompt: "Выбери правильный артикль:", word: "Ich sehe ___ Mann.", options: ["der", "die", "das", "den"], correct: 3, hint: "Akkusativ, мужской род → den" },
  { id: 35, type: "fill", category: "Грамматика", prompt: "Выбери правильный артикль:", word: "Sie hilft ___ Frau.", options: ["der", "die", "das", "den"], correct: 0, hint: "Dativ, женский род → der" },
  { id: 36, type: "fill", category: "Грамматика", prompt: "Выбери правильный артикль:", word: "___ Buch ist interessant.", options: ["Der", "Die", "Das", "Dem"], correct: 2, hint: "Buch — средний род" },
  { id: 37, type: "fill", category: "Грамматика", prompt: "Выбери правильный артикль:", word: "Ich kaufe ___ Apfel.", options: ["der", "die", "den", "das"], correct: 2, hint: "Akkusativ, мужской род → den" },
  { id: 38, type: "fill", category: "Грамматика", prompt: "Выбери правильный артикль:", word: "___ Katze schläft.", options: ["Der", "Die", "Das", "Den"], correct: 1, hint: "Katze — женский род" },
  { id: 39, type: "fill", category: "Грамматика", prompt: "Выбери правильный артикль:", word: "Er gibt ___ Kind ein Geschenk.", options: ["der", "die", "dem", "das"], correct: 2, hint: "Dativ, средний род → dem" },
  { id: 40, type: "fill", category: "Грамматика", prompt: "Выбери правильный артикль:", word: "___ Wasser ist kalt.", options: ["Der", "Die", "Das", "Den"], correct: 2, hint: "Wasser — средний род" },
  { id: 41, type: "choose", category: "Грамматика", prompt: "Какое предложение грамматически верно?", word: null, options: ["Ich gehe morgen zur Schule.", "Ich gehen morgen zur Schule.", "Ich geht morgen zur Schule.", "Ich gehst morgen zur Schule."], correct: 0, hint: "Ich → первое лицо ед. числа → gehe" },
  { id: 42, type: "choose", category: "Грамматика", prompt: "Какое предложение грамматически верно?", word: null, options: ["Er haben ein Auto.", "Er hat ein Auto.", "Er habe ein Auto.", "Er hast ein Auto."], correct: 1, hint: "er/sie/es → hat" },
  { id: 43, type: "choose", category: "Грамматика", prompt: "Какое предложение грамматически верно?", word: null, options: ["Wir spielen Fußball.", "Wir spielt Fußball.", "Wir spielst Fußball.", "Wir spielen Fußballe."], correct: 0, hint: "wir → spielen (окончание -en)" },
  { id: 44, type: "choose", category: "Грамматика", prompt: "Выбери правильный порядок слов:", word: null, options: ["Morgen ich gehe ins Kino.", "Ich morgen gehe ins Kino.", "Morgen gehe ich ins Kino.", "Ins Kino ich gehe morgen."], correct: 2, hint: "Если наречие в начале — глагол на 2-м месте" },
  { id: 45, type: "choose", category: "Грамматика", prompt: "Как правильно сказать в прошедшем времени?", word: null, options: ["Ich habe geschlafen.", "Ich bin geschlafen.", "Ich habe schlafe.", "Ich war schlafe."], correct: 0, hint: "schlafen → Perfekt с haben" },
  { id: 46, type: "choose", category: "Грамматика", prompt: "Какое предложение грамматически верно?", word: null, options: ["Du gehst ins Kino?", "Du gehst im Kino?", "Du gehen ins Kino?", "Du geht ins Kino?"], correct: 0, hint: "du → gehst; ins = in das" },
  { id: 47, type: "choose", category: "Грамматика", prompt: "Выбери правильную форму глагола:", word: null, options: ["Sie lesen ein Buch.", "Sie liest ein Buch.", "Sie lese ein Buch.", "Sie lesen ein Bücher."], correct: 0, hint: "Sie (они) → lesen; Sie (она) → liest" },
  { id: 48, type: "choose", category: "Грамматика", prompt: "Какое предложение верно?", word: null, options: ["Ich bin gegangen.", "Ich habe gegangen.", "Ich war gehen.", "Ich bin gehe."], correct: 0, hint: "gehen → Perfekt с sein" },
  { id: 49, type: "choose", category: "Грамматика", prompt: "Выбери правильный вариант:", word: null, options: ["Er kommt aus Deutschland.", "Er kommt von Deutschland.", "Er kommt aus der Deutschland.", "Er kommt von der Deutschland."], correct: 0, hint: "aus + страна без артикля" },
  { id: 50, type: "choose", category: "Грамматика", prompt: "Какое предложение грамматически верно?", word: null, options: ["Ich möchte Kaffee trinken.", "Ich möchte Kaffee trinkst.", "Ich möchte Kaffee trinkt.", "Ich möchten Kaffee trinken."], correct: 0, hint: "Модальный глагол + инфинитив в конце" },
];

const CATEGORIES = ["Природа", "Еда", "Город", "Дом", "Чувства", "Грамматика"];
const CATEGORY_ICONS = { "Природа": "🌿", "Еда": "🍞", "Город": "🏙️", "Дом": "🏠", "Чувства": "💜", "Грамматика": "📝" };
const PARTNER = { name: "Maria", avatar: "🧑‍🎤", level: "A2" };
const QUESTIONS_PER_ROUND = 8;

function getLevel(xp) { return Math.floor(xp / 200) + 1; }
function xpToNextLevel(xp) { return 200 - (xp % 200); }
function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5); }

// ── AUTH SCREEN ──────────────────────────────────────────────
function AuthScreen({ onAuth }) {
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
      if (error) { setError(error.message); }
      else {
        if (username && data.user) {
          await supabase.from("profiles").update({ username }).eq("id", data.user.id);
        }
        setDone(true);
      }
    }
    setLoading(false);
  }

  const inp = {
    width: "100%", padding: "14px 16px", borderRadius: 12,
    background: "rgba(255,255,255,0.06)", border: "1.5px solid rgba(255,255,255,0.12)",
    color: "#fff", fontSize: 15, outline: "none", boxSizing: "border-box",
  };

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
        {mode === "register" && (
          <input style={inp} placeholder="Никнейм (необязательно)" value={username}
            onChange={e => setUsername(e.target.value)} />
        )}
        <input style={inp} type="email" placeholder="Email" value={email}
          onChange={e => setEmail(e.target.value)} required />
        <input style={inp} type="password" placeholder="Пароль" value={password}
          onChange={e => setPassword(e.target.value)} required />

        {error && <div style={{ fontSize: 13, color: "#ef4444", padding: "8px 12px", background: "rgba(239,68,68,0.1)", borderRadius: 8 }}>{error}</div>}

        <button type="submit" disabled={loading} style={{
          background: "#7C5CFC", color: "#fff", border: "none", borderRadius: 14,
          padding: "16px", fontSize: 16, fontWeight: 700, cursor: "pointer", marginTop: 4,
          opacity: loading ? 0.6 : 1,
        }}>
          {loading ? "..." : mode === "login" ? "Войти" : "Зарегистрироваться"}
        </button>
      </form>

      <div style={{ textAlign: "center", marginTop: 20 }}>
        <button onClick={() => { setMode(m => m === "login" ? "register" : "login"); setError(""); }} style={{
          background: "none", border: "none", color: "rgba(255,255,255,0.4)",
          fontSize: 14, cursor: "pointer", textDecoration: "underline",
        }}>
          {mode === "login" ? "Нет аккаунта? Зарегистрироваться" : "Уже есть аккаунт? Войти"}
        </button>
      </div>
    </div>
  );
}

// ── XP BAR ───────────────────────────────────────────────────
function XPBar({ xp, username }) {
  const level = getLevel(xp);
  const progress = (xp % 200) / 200;
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        <span style={{ fontSize: 13, color: "#fff", fontWeight: 600 }}>
          {username || "Игрок"} · <span style={{ color: "#7C5CFC" }}>Ур. {level}</span>
        </span>
        <span style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}>{xp} XP · ещё {xpToNextLevel(xp)}</span>
      </div>
      <div style={{ height: 6, background: "rgba(255,255,255,0.08)", borderRadius: 3, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${progress * 100}%`, background: "#7C5CFC", borderRadius: 3, transition: "width 0.6s ease" }} />
      </div>
    </div>
  );
}

// ── PROGRESS BAR ─────────────────────────────────────────────
function ProgressBar({ current, total }) {
  return (
    <div style={{ display: "flex", gap: 6, marginBottom: 24 }}>
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} style={{
          flex: 1, height: 4, borderRadius: 2,
          background: i < current ? "#7C5CFC" : "rgba(255,255,255,0.12)",
          transition: "background 0.3s",
        }} />
      ))}
    </div>
  );
}

// ── PARTNER BUBBLE ───────────────────────────────────────────
function PartnerBubble({ answered, isCorrect }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 10,
      padding: "10px 14px", borderRadius: 14,
      background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
      fontSize: 13, color: "rgba(255,255,255,0.6)",
    }}>
      <span style={{ fontSize: 20 }}>{PARTNER.avatar}</span>
      <div>
        <div style={{ fontWeight: 600, color: "rgba(255,255,255,0.85)", fontSize: 12 }}>{PARTNER.name} · {PARTNER.level}</div>
        <div>{answered === null ? "думает..." : isCorrect ? "✓ тоже правильно!" : "✗ ошиблась"}</div>
      </div>
      <div style={{
        marginLeft: "auto", width: 8, height: 8, borderRadius: "50%",
        background: answered === null ? "#f59e0b" : isCorrect ? "#10b981" : "#ef4444",
        boxShadow: `0 0 6px ${answered === null ? "#f59e0b" : isCorrect ? "#10b981" : "#ef4444"}`,
      }} />
    </div>
  );
}

// ── SETUP SCREEN ─────────────────────────────────────────────
function SetupScreen({ onStart }) {
  const [selected, setSelected] = useState(new Set(CATEGORIES));

  function toggle(cat) {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(cat)) { if (next.size > 1) next.delete(cat); }
      else next.add(cat);
      return next;
    });
  }

  return (
    <div style={{ paddingTop: 60 }}>
      <div style={{ fontSize: 11, letterSpacing: 3, color: "#7C5CFC", fontWeight: 600, marginBottom: 12, textTransform: "uppercase" }}>DuoPar · Deutsch</div>
      <h1 style={{ fontSize: 28, fontWeight: 800, color: "#fff", margin: "0 0 6px" }}>Выбери темы</h1>
      <div style={{ fontSize: 14, color: "rgba(255,255,255,0.35)", marginBottom: 28 }}>Можно выбрать несколько</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 28 }}>
        {CATEGORIES.map(cat => {
          const on = selected.has(cat);
          return (
            <button key={cat} onClick={() => toggle(cat)} style={{
              background: on ? "rgba(124,92,252,0.2)" : "rgba(255,255,255,0.04)",
              border: `1.5px solid ${on ? "#7C5CFC" : "rgba(255,255,255,0.1)"}`,
              borderRadius: 14, padding: "14px 12px", cursor: "pointer", textAlign: "left", transition: "all 0.2s",
            }}>
              <div style={{ fontSize: 22, marginBottom: 4 }}>{CATEGORY_ICONS[cat]}</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: on ? "#fff" : "rgba(255,255,255,0.5)" }}>{cat}</div>
              <div style={{ fontSize: 11, color: on ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.2)", marginTop: 2 }}>
                {ALL_QUESTIONS.filter(q => q.category === cat).length} вопросов
              </div>
            </button>
          );
        })}
      </div>
      <button onClick={() => onStart([...selected])} style={{
        width: "100%", background: "#7C5CFC", color: "#fff", border: "none",
        borderRadius: 16, padding: "18px", fontSize: 16, fontWeight: 700, cursor: "pointer",
      }}>Начать квест →</button>
    </div>
  );
}

// ── RESULT SCREEN ────────────────────────────────────────────
function ResultScreen({ score, total, xpEarned, profile, onRestart }) {
  const pct = Math.round((score / total) * 100);
  const emoji = pct >= 80 ? "🏆" : pct >= 60 ? "⭐" : "💪";
  const msg = pct >= 80 ? "Отлично сыграно!" : pct >= 60 ? "Хороший результат!" : "Продолжай тренироваться!";
  const partnerScore = Math.min(total, Math.max(0, score + Math.floor(Math.random() * 3) - 1));

  return (
    <div style={{ textAlign: "center", padding: "32px 0" }}>
      <div style={{ fontSize: 64, marginBottom: 16 }}>{emoji}</div>
      <div style={{ fontSize: 28, fontWeight: 700, color: "#fff", marginBottom: 8 }}>{msg}</div>
      <div style={{ fontSize: 15, color: "rgba(255,255,255,0.5)", marginBottom: 24 }}>Вы с Maria ответили правильно на</div>
      <div style={{
        display: "inline-flex", flexDirection: "column", alignItems: "center",
        background: "rgba(124,92,252,0.15)", border: "1px solid rgba(124,92,252,0.3)",
        borderRadius: 20, padding: "24px 48px", marginBottom: 20,
      }}>
        <div style={{ fontSize: 56, fontWeight: 800, color: "#7C5CFC" }}>{score}/{total}</div>
        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>{pct}% точность</div>
      </div>
      <div style={{
        background: "rgba(124,92,252,0.1)", border: "1px solid rgba(124,92,252,0.2)",
        borderRadius: 14, padding: "14px 20px", marginBottom: 20,
        display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
      }}>
        <span style={{ fontSize: 20 }}>⚡</span>
        <span style={{ color: "#7C5CFC", fontWeight: 700, fontSize: 16 }}>+{xpEarned} XP</span>
        <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 13 }}>· уровень {getLevel((profile?.xp || 0))}</span>
      </div>
      <div style={{ display: "flex", gap: 12, justifyContent: "center", marginBottom: 28 }}>
        {[{ label: profile?.username || "ты", val: score }, { label: "Maria", val: partnerScore }].map(x => (
          <div key={x.label} style={{ background: "rgba(255,255,255,0.05)", borderRadius: 12, padding: "12px 20px", textAlign: "center" }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: "#fff" }}>{x.val}</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{x.label}</div>
          </div>
        ))}
      </div>
      <button onClick={onRestart} style={{
        background: "#7C5CFC", color: "#fff", border: "none",
        borderRadius: 14, padding: "16px 40px", fontSize: 16,
        fontWeight: 600, cursor: "pointer", width: "100%",
      }}>Новый раунд →</button>
    </div>
  );
}

// ── PROFILE SCREEN ───────────────────────────────────────────
function ProfileScreen({ profile, session, onUpdate, onBack }) {
  const [editing, setEditing] = useState(false);
  const [username, setUsername] = useState(profile?.username || "");
  const [saving, setSaving] = useState(false);

  const level = getLevel(profile?.xp || 0);
  const xp = profile?.xp || 0;
  const progress = (xp % 200) / 200;

  async function save() {
    setSaving(true);
    await supabase.from("profiles").update({ username }).eq("id", session.user.id);
    onUpdate({ ...profile, username });
    setEditing(false);
    setSaving(false);
  }

  const LEVEL_TITLES = ["Новичок", "Ученик", "Практик", "Знаток", "Мастер", "Эксперт"];
  const title = LEVEL_TITLES[Math.min(level - 1, LEVEL_TITLES.length - 1)];

  return (
    <div style={{ paddingTop: 60 }}>
      <button onClick={onBack} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", fontSize: 13, cursor: "pointer", marginBottom: 24, padding: 0 }}>
        ← Назад
      </button>

      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <div style={{ width: 80, height: 80, borderRadius: 24, background: "rgba(124,92,252,0.2)", border: "2px solid rgba(124,92,252,0.4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, margin: "0 auto 16px" }}>
          🧑‍💻
        </div>
        {editing ? (
          <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 8 }}>
            <input value={username} onChange={e => setUsername(e.target.value)}
              style={{ padding: "8px 12px", borderRadius: 10, background: "rgba(255,255,255,0.08)", border: "1.5px solid rgba(124,92,252,0.5)", color: "#fff", fontSize: 16, fontWeight: 700, textAlign: "center", outline: "none" }} />
            <button onClick={save} disabled={saving} style={{ background: "#7C5CFC", color: "#fff", border: "none", borderRadius: 10, padding: "8px 14px", cursor: "pointer", fontWeight: 600 }}>
              {saving ? "..." : "✓"}
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 4 }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: "#fff" }}>{profile?.username || "Игрок"}</div>
            <button onClick={() => setEditing(true)} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.3)", cursor: "pointer", fontSize: 14 }}>✏️</button>
          </div>
        )}
        <div style={{ fontSize: 13, color: "#7C5CFC", fontWeight: 600 }}>{title}</div>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", marginTop: 4 }}>{session.user.email}</div>
      </div>

      <div style={{ background: "rgba(124,92,252,0.1)", border: "1px solid rgba(124,92,252,0.2)", borderRadius: 20, padding: 20, marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>Уровень {level}</span>
          <span style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>{xp} / {level * 200} XP</span>
        </div>
        <div style={{ height: 8, background: "rgba(255,255,255,0.08)", borderRadius: 4, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${progress * 100}%`, background: "#7C5CFC", borderRadius: 4, transition: "width 0.6s ease" }} />
        </div>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", marginTop: 8 }}>ещё {xpToNextLevel(xp)} XP до уровня {level + 1}</div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 28 }}>
        {[
          { label: "Раундов сыграно", value: profile?.rounds_played || 0, icon: "🎮" },
          { label: "Всего XP", value: xp, icon: "⚡" },
          { label: "Текущий уровень", value: level, icon: "🏅" },
          { label: "До след. уровня", value: `${xpToNextLevel(xp)} XP`, icon: "🎯" },
        ].map(item => (
          <div key={item.label} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: "14px 16px" }}>
            <div style={{ fontSize: 20, marginBottom: 6 }}>{item.icon}</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#fff" }}>{item.value}</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>{item.label}</div>
          </div>
        ))}
      </div>

      <button onClick={() => supabase.auth.signOut()} style={{
        width: "100%", background: "rgba(239,68,68,0.1)", color: "#ef4444",
        border: "1px solid rgba(239,68,68,0.2)", borderRadius: 14, padding: "14px",
        fontSize: 15, fontWeight: 600, cursor: "pointer",
      }}>Выйти из аккаунта</button>
    </div>
  );
}

// ── MAIN APP ─────────────────────────────────────────────────
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

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => setSession(session));
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session?.user) {
      supabase.from("profiles").select("*").eq("id", session.user.id).single()
        .then(({ data }) => setProfile(data));
    } else {
      setProfile(null);
    }
  }, [session]);

  const q = questions[qIndex];

  function startGame(categories) {
    const pool = ALL_QUESTIONS.filter(q => categories.includes(q.category));
    setQuestions(shuffle(pool).slice(0, QUESTIONS_PER_ROUND));
    setQIndex(0); setSelected(null); setRevealed(false);
    setScore(0); setPartnerState(null); setShowHint(false); setXpEarned(0);
    setScreen("quiz");
  }

  useEffect(() => {
    if (selected !== null && !revealed) {
      const timer = setTimeout(() => {
        const partnerCorrect = Math.random() > 0.35;
        setPartnerState(partnerCorrect);
        setRevealed(true);
        if (selected === q.correct) {
          const bonus = partnerCorrect ? 20 : 10;
          setXpEarned(prev => prev + bonus);
          setScore(s => s + 1);
        }
      }, 800 + Math.random() * 1200);
      return () => clearTimeout(timer);
    }
  }, [selected]);

  useEffect(() => {
    if (revealed) {
      let c = 3;
      setCountdown(c);
      const iv = setInterval(() => {
        c -= 1;
        if (c <= 0) {
          clearInterval(iv);
          setCountdown(null);
          if (qIndex + 1 >= questions.length) setScreen("result");
          else {
            setQIndex(i => i + 1);
            setSelected(null); setRevealed(false); setPartnerState(null); setShowHint(false);
          }
        } else setCountdown(c);
      }, 1000);
      return () => clearInterval(iv);
    }
  }, [revealed]);

  useEffect(() => {
    if (screen === "result" && xpEarned > 0 && session?.user) {
      const newXP = (profile?.xp || 0) + xpEarned;
      const newRounds = (profile?.rounds_played || 0) + 1;
      supabase.from("profiles").update({ xp: newXP, rounds_played: newRounds }).eq("id", session.user.id)
        .then(() => setProfile(p => ({ ...p, xp: newXP, rounds_played: newRounds })));
    }
  }, [screen]);

  function getOptionStyle(i) {
    const base = {
      width: "100%", padding: "15px 18px", borderRadius: 14, border: "1.5px solid",
      fontSize: 15, fontWeight: 500, cursor: revealed ? "default" : "pointer",
      textAlign: "left", transition: "all 0.2s",
    };
    if (!revealed) return {
      ...base,
      background: selected === i ? "rgba(124,92,252,0.2)" : "rgba(255,255,255,0.04)",
      borderColor: selected === i ? "#7C5CFC" : "rgba(255,255,255,0.1)", color: "#fff",
    };
    if (i === q.correct) return { ...base, background: "rgba(16,185,129,0.15)", borderColor: "#10b981", color: "#10b981" };
    if (i === selected) return { ...base, background: "rgba(239,68,68,0.12)", borderColor: "#ef4444", color: "#ef4444" };
    return { ...base, background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.3)" };
  }

  const TYPE_LABEL = { translate: "Перевод", fill: "Артикли", choose: "Грамматика" };

  if (!session) return (
    <div style={{ minHeight: "100vh", background: "#0f0d1a", display: "flex", justifyContent: "center", fontFamily: "'Inter', system-ui, sans-serif" }}>
      <div style={{ width: "100%", maxWidth: 420, padding: "0 20px 40px" }}>
        <AuthScreen />
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#0f0d1a", display: "flex", justifyContent: "center", padding: "0 0 40px", fontFamily: "'Inter', system-ui, sans-serif" }}>
      <div style={{ width: "100%", maxWidth: 420, padding: "0 20px" }}>

        {/* PROFILE */}
        {screen === "profile" && (
          <ProfileScreen profile={profile} session={session} onUpdate={setProfile} onBack={() => setScreen("lobby")} />
        )}

        {/* LOBBY */}
        {screen === "lobby" && (
          <div style={{ paddingTop: 60 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
              <div style={{ flex: 1 }}><XPBar xp={profile?.xp || 0} username={profile?.username} /></div>
              <button onClick={() => setScreen("profile")} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, width: 40, height: 40, fontSize: 18, cursor: "pointer", marginLeft: 12, flexShrink: 0 }}>
                🧑‍💻
              </button>
            </div>

            <div style={{ marginBottom: 32 }}>
              <div style={{ fontSize: 11, letterSpacing: 3, color: "#7C5CFC", fontWeight: 600, marginBottom: 12, textTransform: "uppercase" }}>DuoPar · Deutsch</div>
              <h1 style={{ fontSize: 32, fontWeight: 800, color: "#fff", margin: 0, lineHeight: 1.2 }}>
                Учи немецкий<br /><span style={{ color: "#7C5CFC" }}>вместе</span>
              </h1>
              <div style={{ fontSize: 14, color: "rgba(255,255,255,0.35)", marginTop: 12 }}>
                {profile?.rounds_played || 0} раундов сыграно
              </div>
            </div>

            <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 20, padding: 20, marginBottom: 24 }}>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 14, fontWeight: 500 }}>ПАРТНЁР НАЙДЕН</div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 48, height: 48, borderRadius: 14, fontSize: 24, background: "rgba(124,92,252,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {PARTNER.avatar}
                </div>
                <div>
                  <div style={{ fontWeight: 700, color: "#fff", fontSize: 16 }}>{PARTNER.name}</div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>Уровень {PARTNER.level} · онлайн сейчас</div>
                </div>
                <div style={{ marginLeft: "auto", width: 10, height: 10, borderRadius: "50%", background: "#10b981", boxShadow: "0 0 8px #10b981" }} />
              </div>
            </div>

            <button onClick={() => setScreen("setup")} style={{
              width: "100%", background: "#7C5CFC", color: "#fff", border: "none",
              borderRadius: 16, padding: "18px", fontSize: 16, fontWeight: 700, cursor: "pointer",
            }}>Начать квест →</button>
          </div>
        )}

        {/* SETUP */}
        {screen === "setup" && <SetupScreen onStart={startGame} />}

        {/* QUIZ */}
        {screen === "quiz" && q && (
          <div style={{ paddingTop: 40 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", fontWeight: 500 }}>{qIndex + 1} / {questions.length}</div>
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <span style={{ fontSize: 12, color: "#7C5CFC", fontWeight: 600 }}>⚡ {(profile?.xp || 0) + xpEarned} XP</span>
                <div style={{ fontSize: 11, background: "rgba(124,92,252,0.15)", color: "#7C5CFC", padding: "4px 10px", borderRadius: 20, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase" }}>
                  {TYPE_LABEL[q.type]}
                </div>
              </div>
            </div>

            <ProgressBar current={qIndex} total={questions.length} />
            <PartnerBubble answered={selected !== null ? partnerState : null} isCorrect={partnerState} />

            <div style={{ margin: "28px 0 24px" }}>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginBottom: 10 }}>{q.prompt}</div>
              {q.word && <div style={{ fontSize: 30, fontWeight: 800, color: "#fff", lineHeight: 1.2 }}>{q.word}</div>}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
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
              <div style={{
                marginTop: 16, padding: "12px 16px",
                background: selected === q.correct ? "rgba(16,185,129,0.08)" : "rgba(239,68,68,0.08)",
                border: `1px solid ${selected === q.correct ? "rgba(16,185,129,0.25)" : "rgba(239,68,68,0.2)"}`,
                borderRadius: 12, fontSize: 13, color: selected === q.correct ? "#10b981" : "#ef4444",
                display: "flex", justifyContent: "space-between", alignItems: "center",
              }}>
                <span>{selected === q.correct ? "✓ Правильно!" : `✗ Верно: ${q.options[q.correct]}`}</span>
                {countdown !== null && <span style={{ opacity: 0.6, fontSize: 12 }}>далее через {countdown}...</span>}
              </div>
            )}
          </div>
        )}

        {/* RESULT */}
        {screen === "result" && (
          <div style={{ paddingTop: 60 }}>
            <ResultScreen score={score} total={questions.length} xpEarned={xpEarned} profile={profile} onRestart={() => setScreen("lobby")} />
          </div>
        )}
      </div>
    </div>
  );
}
