import { useState, useEffect, useRef } from "react";
import { supabase } from "./supabase";

// в”Ђв”Ђ Р—Р’РЈРљР (Web Audio API) в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ
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

// в”Ђв”Ђ РљРћРќР¤Р•РўРўР в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ
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

// в”Ђв”Ђ Р’РћРџР РћРЎР« РџРћ РЈР РћР’РќРЇРњ в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ

const ALL_QUESTIONS = [
  // A0 вЂ” Р§РёСЃР»Р° Рё С†РІРµС‚Р°
  { id: 1, level: "A0", type: "translate", category: "РћСЃРЅРѕРІС‹", prompt: "РљР°Рє РїРµСЂРµРІРѕРґРёС‚СЃСЏ СЃР»РѕРІРѕ?", word: "eins", options: ["Р”РІР°", "РўСЂРё", "РћРґРёРЅ", "Р§РµС‚С‹СЂРµ"], correct: 2, hint: "РџРµСЂРІРѕРµ С‡РёСЃР»Рѕ" },
  { id: 2, level: "A0", type: "translate", category: "РћСЃРЅРѕРІС‹", prompt: "РљР°Рє РїРµСЂРµРІРѕРґРёС‚СЃСЏ СЃР»РѕРІРѕ?", word: "zwei", options: ["РћРґРёРЅ", "Р”РІР°", "РўСЂРё", "РџСЏС‚СЊ"], correct: 1, hint: "1 + 1 = ?" },
  { id: 3, level: "A0", type: "translate", category: "РћСЃРЅРѕРІС‹", prompt: "РљР°Рє РїРµСЂРµРІРѕРґРёС‚СЃСЏ СЃР»РѕРІРѕ?", word: "rot", options: ["РЎРёРЅРёР№", "Р—РµР»С‘РЅС‹Р№", "РљСЂР°СЃРЅС‹Р№", "Р–С‘Р»С‚С‹Р№"], correct: 2, hint: "Р¦РІРµС‚ РєСЂРѕРІРё" },
  { id: 4, level: "A0", type: "translate", category: "РћСЃРЅРѕРІС‹", prompt: "РљР°Рє РїРµСЂРµРІРѕРґРёС‚СЃСЏ СЃР»РѕРІРѕ?", word: "blau", options: ["РљСЂР°СЃРЅС‹Р№", "РЎРёРЅРёР№", "Р‘РµР»С‹Р№", "Р§С‘СЂРЅС‹Р№"], correct: 1, hint: "Р¦РІРµС‚ РЅРµР±Р°" },
  { id: 5, level: "A0", type: "translate", category: "РћСЃРЅРѕРІС‹", prompt: "РљР°Рє РїРµСЂРµРІРѕРґРёС‚СЃСЏ СЃР»РѕРІРѕ?", word: "Hallo", options: ["РџРѕРєР°", "РЎРїР°СЃРёР±Рѕ", "РџСЂРёРІРµС‚", "РџРѕР¶Р°Р»СѓР№СЃС‚Р°"], correct: 2, hint: "РџСЂРёРІРµС‚СЃС‚РІРёРµ" },
  { id: 6, level: "A0", type: "translate", category: "РћСЃРЅРѕРІС‹", prompt: "РљР°Рє РїРµСЂРµРІРѕРґРёС‚СЃСЏ СЃР»РѕРІРѕ?", word: "Danke", options: ["РџСЂРёРІРµС‚", "РџРѕР¶Р°Р»СѓР№СЃС‚Р°", "РЎРїР°СЃРёР±Рѕ", "РџРѕРєР°"], correct: 2, hint: "Р“РѕРІРѕСЂСЏС‚ РІ РѕС‚РІРµС‚ РЅР° РїРѕРјРѕС‰СЊ" },
  { id: 7, level: "A0", type: "translate", category: "РћСЃРЅРѕРІС‹", prompt: "РљР°Рє РїРµСЂРµРІРѕРґРёС‚СЃСЏ СЃР»РѕРІРѕ?", word: "ja", options: ["РќРµС‚", "РњРѕР¶РµС‚ Р±С‹С‚СЊ", "Р”Р°", "РќРёРєРѕРіРґР°"], correct: 2, hint: "РџСЂРѕС‚РёРІРѕРїРѕР»РѕР¶РЅРѕСЃС‚СЊ В«РЅРµС‚В»" },
  { id: 8, level: "A0", type: "translate", category: "РћСЃРЅРѕРІС‹", prompt: "РљР°Рє РїРµСЂРµРІРѕРґРёС‚СЃСЏ СЃР»РѕРІРѕ?", word: "nein", options: ["Р”Р°", "РќРµС‚", "РњРѕР¶РµС‚", "Р’СЃРµРіРґР°"], correct: 1, hint: "РџСЂРѕС‚РёРІРѕРїРѕР»РѕР¶РЅРѕСЃС‚СЊ В«РґР°В»" },
  { id: 9, level: "A0", type: "translate", category: "РћСЃРЅРѕРІС‹", prompt: "РљР°Рє РїРµСЂРµРІРѕРґРёС‚СЃСЏ СЃР»РѕРІРѕ?", word: "groГџ", options: ["РњР°Р»РµРЅСЊРєРёР№", "Р‘С‹СЃС‚СЂС‹Р№", "Р‘РѕР»СЊС€РѕР№", "РўРёС…РёР№"], correct: 2, hint: "РђРЅС‚РѕРЅРёРј В«kleinВ»" },
  { id: 10, level: "A0", type: "translate", category: "РћСЃРЅРѕРІС‹", prompt: "РљР°Рє РїРµСЂРµРІРѕРґРёС‚СЃСЏ СЃР»РѕРІРѕ?", word: "klein", options: ["Р‘РѕР»СЊС€РѕР№", "РњР°Р»РµРЅСЊРєРёР№", "РЎС‚Р°СЂС‹Р№", "РќРѕРІС‹Р№"], correct: 1, hint: "РђРЅС‚РѕРЅРёРј В«groГџВ»" },
  { id: 11, level: "A0", type: "translate", category: "РћСЃРЅРѕРІС‹", prompt: "РљР°Рє РїРµСЂРµРІРѕРґРёС‚СЃСЏ СЃР»РѕРІРѕ?", word: "Wasser", options: ["РҐР»РµР±", "РњРѕР»РѕРєРѕ", "Р’РѕРґР°", "РЎРѕРє"], correct: 2, hint: "Hв‚‚O" },
  { id: 12, level: "A0", type: "translate", category: "РћСЃРЅРѕРІС‹", prompt: "РљР°Рє РїРµСЂРµРІРѕРґРёС‚СЃСЏ СЃР»РѕРІРѕ?", word: "Haus", options: ["РњР°С€РёРЅР°", "Р”РѕРј", "Р”РµСЂРµРІРѕ", "Р”РѕСЂРѕРіР°"], correct: 1, hint: "Р“РґРµ Р¶РёРІСѓС‚ Р»СЋРґРё" },
  { id: 13, level: "A0", type: "translate", category: "РћСЃРЅРѕРІС‹", prompt: "РљР°Рє РїРµСЂРµРІРѕРґРёС‚СЃСЏ СЃР»РѕРІРѕ?", word: "Hund", options: ["РљРѕС€РєР°", "РџС‚РёС†Р°", "РЎРѕР±Р°РєР°", "Р С‹Р±Р°"], correct: 2, hint: "Р›СѓС‡С€РёР№ РґСЂСѓРі С‡РµР»РѕРІРµРєР°" },
  { id: 14, level: "A0", type: "translate", category: "РћСЃРЅРѕРІС‹", prompt: "РљР°Рє РїРµСЂРµРІРѕРґРёС‚СЃСЏ СЃР»РѕРІРѕ?", word: "Katze", options: ["РЎРѕР±Р°РєР°", "РљРѕС€РєР°", "РњС‹С€СЊ", "Р›РѕС€Р°РґСЊ"], correct: 1, hint: "РњСЏСѓРєР°РµС‚" },
  { id: 15, level: "A0", type: "translate", category: "РћСЃРЅРѕРІС‹", prompt: "РљР°Рє РїРµСЂРµРІРѕРґРёС‚СЃСЏ СЃР»РѕРІРѕ?", word: "gut", options: ["РџР»РѕС…РѕР№", "РҐРѕСЂРѕС€РёР№", "Р‘С‹СЃС‚СЂС‹Р№", "РЎС‚Р°СЂС‹Р№"], correct: 1, hint: "РђРЅС‚РѕРЅРёРј В«schlechtВ»" },
  { id: 16, level: "A0", type: "translate", category: "РћСЃРЅРѕРІС‹", prompt: "РљР°Рє РїРµСЂРµРІРѕРґРёС‚СЃСЏ СЃР»РѕРІРѕ?", word: "Mutter", options: ["РћС‚РµС†", "РЎРµСЃС‚СЂР°", "РњР°С‚СЊ", "Р‘Р°Р±СѓС€РєР°"], correct: 2, hint: "Р–РµРЅС‰РёРЅР°, РєРѕС‚РѕСЂР°СЏ С‚РµР±СЏ СЂРѕРґРёР»Р°" },
  { id: 17, level: "A0", type: "translate", category: "РћСЃРЅРѕРІС‹", prompt: "РљР°Рє РїРµСЂРµРІРѕРґРёС‚СЃСЏ СЃР»РѕРІРѕ?", word: "Vater", options: ["РњР°С‚СЊ", "РћС‚РµС†", "Р‘СЂР°С‚", "Р”РµРґСѓС€РєР°"], correct: 1, hint: "РџР°РїР°" },
  { id: 18, level: "A0", type: "translate", category: "РћСЃРЅРѕРІС‹", prompt: "РљР°Рє РїРµСЂРµРІРѕРґРёС‚СЃСЏ СЃР»РѕРІРѕ?", word: "essen", options: ["РџРёС‚СЊ", "РЎРїР°С‚СЊ", "Р•СЃС‚СЊ", "РРґС‚Рё"], correct: 2, hint: "Р§С‚Рѕ РґРµР»Р°СЋС‚ Р·Р° СЃС‚РѕР»РѕРј" },
  { id: 19, level: "A0", type: "translate", category: "РћСЃРЅРѕРІС‹", prompt: "РљР°Рє РїРµСЂРµРІРѕРґРёС‚СЃСЏ СЃР»РѕРІРѕ?", word: "trinken", options: ["Р•СЃС‚СЊ", "РџРёС‚СЊ", "Р§РёС‚Р°С‚СЊ", "РџРёСЃР°С‚СЊ"], correct: 1, hint: "Р§С‚Рѕ РґРµР»Р°СЋС‚ СЃРѕ СЃС‚Р°РєР°РЅРѕРј РІРѕРґС‹" },
  { id: 20, level: "A0", type: "translate", category: "РћСЃРЅРѕРІС‹", prompt: "РљР°Рє РїРµСЂРµРІРѕРґРёС‚СЃСЏ СЃР»РѕРІРѕ?", word: "schlafen", options: ["Р Р°Р±РѕС‚Р°С‚СЊ", "РРіСЂР°С‚СЊ", "РЎРїР°С‚СЊ", "Р‘РµР¶Р°С‚СЊ"], correct: 2, hint: "Р§С‚Рѕ РґРµР»Р°СЋС‚ РЅРѕС‡СЊСЋ" },

  // A1 вЂ” РџСЂРёСЂРѕРґР°, Р•РґР°, Р“РѕСЂРѕРґ
  { id: 21, level: "A1", type: "translate", category: "РџСЂРёСЂРѕРґР°", prompt: "РљР°Рє РїРµСЂРµРІРѕРґРёС‚СЃСЏ СЃР»РѕРІРѕ?", word: "die BrГјcke", options: ["РњРѕСЃС‚", "Р РµРєР°", "Р”РѕСЂРѕРіР°", "Р‘РµСЂРµРі"], correct: 0, hint: "РџРѕ РЅРµР№ РїРµСЂРµС…РѕРґСЏС‚ С‡РµСЂРµР· СЂРµРєСѓ" },
  { id: 22, level: "A1", type: "translate", category: "РџСЂРёСЂРѕРґР°", prompt: "РљР°Рє РїРµСЂРµРІРѕРґРёС‚СЃСЏ СЃР»РѕРІРѕ?", word: "die Wolke", options: ["Р’РѕРґР°", "РћР±Р»Р°РєРѕ", "Р’РµС‚РµСЂ", "Р—РµРјР»СЏ"], correct: 1, hint: "Р‘С‹РІР°РµС‚ РЅР° РЅРµР±Рµ" },
  { id: 23, level: "A1", type: "translate", category: "РџСЂРёСЂРѕРґР°", prompt: "РљР°Рє РїРµСЂРµРІРѕРґРёС‚СЃСЏ СЃР»РѕРІРѕ?", word: "der Schmetterling", options: ["Р–СѓРє", "Р‘Р°Р±РѕС‡РєР°", "РЎС‚СЂРµРєРѕР·Р°", "РџС‡РµР»Р°"], correct: 1, hint: "Р›РµС‚Р°РµС‚ СЃСЂРµРґРё С†РІРµС‚РѕРІ" },
  { id: 24, level: "A1", type: "translate", category: "РџСЂРёСЂРѕРґР°", prompt: "РљР°Рє РїРµСЂРµРІРѕРґРёС‚СЃСЏ СЃР»РѕРІРѕ?", word: "der Wald", options: ["РџРѕР»Рµ", "Р›РµСЃ", "Р“РѕСЂР°", "РћР·РµСЂРѕ"], correct: 1, hint: "РњРЅРѕРіРѕ РґРµСЂРµРІСЊРµРІ" },
  { id: 25, level: "A1", type: "translate", category: "РџСЂРёСЂРѕРґР°", prompt: "РљР°Рє РїРµСЂРµРІРѕРґРёС‚СЃСЏ СЃР»РѕРІРѕ?", word: "der Regen", options: ["РЎРЅРµРі", "РўСѓРјР°РЅ", "Р”РѕР¶РґСЊ", "Р’РµС‚РµСЂ"], correct: 2, hint: "РљР°РїР°РµС‚ СЃ РЅРµР±Р°" },
  { id: 26, level: "A1", type: "translate", category: "РџСЂРёСЂРѕРґР°", prompt: "РљР°Рє РїРµСЂРµРІРѕРґРёС‚СЃСЏ СЃР»РѕРІРѕ?", word: "die Blume", options: ["Р”РµСЂРµРІРѕ", "РўСЂР°РІР°", "РљСѓСЃС‚", "Р¦РІРµС‚РѕРє"], correct: 3, hint: "Р Р°СЃС‚С‘С‚ РІ СЃР°РґСѓ, РїР°С…РЅРµС‚ РєСЂР°СЃРёРІРѕ" },
  { id: 27, level: "A1", type: "translate", category: "РџСЂРёСЂРѕРґР°", prompt: "РљР°Рє РїРµСЂРµРІРѕРґРёС‚СЃСЏ СЃР»РѕРІРѕ?", word: "der Schnee", options: ["Р›С‘Рґ", "РЎРЅРµРі", "Р“СЂР°Рґ", "РРЅРµР№"], correct: 1, hint: "Р‘РµР»С‹Р№ Рё С…РѕР»РѕРґРЅС‹Р№" },
  { id: 28, level: "A1", type: "translate", category: "РџСЂРёСЂРѕРґР°", prompt: "РљР°Рє РїРµСЂРµРІРѕРґРёС‚СЃСЏ СЃР»РѕРІРѕ?", word: "der Fluss", options: ["РњРѕСЂРµ", "Р РµРєР°", "РћР·РµСЂРѕ", "Р СѓС‡РµР№"], correct: 1, hint: "РўРµС‡С‘С‚ РјРµР¶РґСѓ Р±РµСЂРµРіР°РјРё" },
  { id: 29, level: "A1", type: "translate", category: "Р•РґР°", prompt: "РљР°Рє РїРµСЂРµРІРѕРґРёС‚СЃСЏ СЃР»РѕРІРѕ?", word: "der Kuchen", options: ["РҐР»РµР±", "РџРёСЂРѕРі", "РЎСѓРї", "РЎС‹СЂ"], correct: 1, hint: "РЎР»Р°РґРєРѕРµ, С‡Р°СЃС‚Рѕ Рє РєРѕС„Рµ" },
  { id: 30, level: "A1", type: "translate", category: "Р•РґР°", prompt: "РљР°Рє РїРµСЂРµРІРѕРґРёС‚СЃСЏ СЃР»РѕРІРѕ?", word: "das Brot", options: ["Р‘СѓР»РѕС‡РєР°", "РџРёСЂРѕРі", "РҐР»РµР±", "РџРµС‡РµРЅСЊРµ"], correct: 2, hint: "РћСЃРЅРѕРІР° РЅРµРјРµС†РєРѕРіРѕ СЃС‚РѕР»Р°" },
  { id: 31, level: "A1", type: "translate", category: "Р•РґР°", prompt: "РљР°Рє РїРµСЂРµРІРѕРґРёС‚СЃСЏ СЃР»РѕРІРѕ?", word: "die Kartoffel", options: ["РњРѕСЂРєРѕРІСЊ", "Р›СѓРє", "РљР°СЂС‚РѕС„РµР»СЊ", "РљР°РїСѓСЃС‚Р°"], correct: 2, hint: "РР· РЅРµС‘ РґРµР»Р°СЋС‚ РєР°СЂС‚РѕС€РєСѓ-С„СЂРё" },
  { id: 32, level: "A1", type: "translate", category: "Р•РґР°", prompt: "РљР°Рє РїРµСЂРµРІРѕРґРёС‚СЃСЏ СЃР»РѕРІРѕ?", word: "der KГ¤se", options: ["РњР°СЃР»Рѕ", "РњРѕР»РѕРєРѕ", "РўРІРѕСЂРѕРі", "РЎС‹СЂ"], correct: 3, hint: "Р”РµР»Р°СЋС‚ РёР· РјРѕР»РѕРєР°, Р±С‹РІР°РµС‚ СЃ РґС‹СЂРєР°РјРё" },
  { id: 33, level: "A1", type: "translate", category: "Р•РґР°", prompt: "РљР°Рє РїРµСЂРµРІРѕРґРёС‚СЃСЏ СЃР»РѕРІРѕ?", word: "das Ei", options: ["РњРѕР»РѕРєРѕ", "РЇР№С†Рѕ", "РњСЏСЃРѕ", "Р С‹Р±Р°"], correct: 1, hint: "РљР»Р°РґСѓС‚ РІ РѕРјР»РµС‚" },
  { id: 34, level: "A1", type: "translate", category: "Р•РґР°", prompt: "РљР°Рє РїРµСЂРµРІРѕРґРёС‚СЃСЏ СЃР»РѕРІРѕ?", word: "der Apfel", options: ["Р“СЂСѓС€Р°", "РЎР»РёРІР°", "РЇР±Р»РѕРєРѕ", "Р’РёС€РЅСЏ"], correct: 2, hint: "РљСЂР°СЃРЅС‹Р№ РёР»Рё Р·РµР»С‘РЅС‹Р№ С„СЂСѓРєС‚" },
  { id: 35, level: "A1", type: "translate", category: "Р“РѕСЂРѕРґ", prompt: "РљР°Рє РїРµСЂРµРІРѕРґРёС‚СЃСЏ СЃР»РѕРІРѕ?", word: "der Bahnhof", options: ["РђСЌСЂРѕРїРѕСЂС‚", "Р’РѕРєР·Р°Р»", "РџРѕСЂС‚", "РЎС‚РѕСЏРЅРєР°"], correct: 1, hint: "Bahn вЂ” РїРѕРµР·Рґ, Hof вЂ” РґРІРѕСЂ" },
  { id: 36, level: "A1", type: "translate", category: "Р“РѕСЂРѕРґ", prompt: "РљР°Рє РїРµСЂРµРІРѕРґРёС‚СЃСЏ СЃР»РѕРІРѕ?", word: "die StraГџe", options: ["РџР»РѕС‰Р°РґСЊ", "РџРµСЂРµСѓР»РѕРє", "РЈР»РёС†Р°", "РџСЂРѕСЃРїРµРєС‚"], correct: 2, hint: "РџРѕ РЅРµР№ РµРґСѓС‚ РјР°С€РёРЅС‹" },
  { id: 37, level: "A1", type: "translate", category: "Р“РѕСЂРѕРґ", prompt: "РљР°Рє РїРµСЂРµРІРѕРґРёС‚СЃСЏ СЃР»РѕРІРѕ?", word: "das Krankenhaus", options: ["РЁРєРѕР»Р°", "Р‘РѕР»СЊРЅРёС†Р°", "РђРїС‚РµРєР°", "Р‘Р°РЅРє"], correct: 1, hint: "Krank вЂ” Р±РѕР»СЊРЅРѕР№, Haus вЂ” РґРѕРј" },
  { id: 38, level: "A1", type: "translate", category: "Р“РѕСЂРѕРґ", prompt: "РљР°Рє РїРµСЂРµРІРѕРґРёС‚СЃСЏ СЃР»РѕРІРѕ?", word: "die Bibliothek", options: ["РњСѓР·РµР№", "РўРµР°С‚СЂ", "Р‘РёР±Р»РёРѕС‚РµРєР°", "Р“Р°Р»РµСЂРµСЏ"], correct: 2, hint: "РўР°Рј Р±РµСЂСѓС‚ РєРЅРёРіРё" },
  { id: 39, level: "A1", type: "translate", category: "Р”РѕРј", prompt: "РљР°Рє РїРµСЂРµРІРѕРґРёС‚СЃСЏ СЃР»РѕРІРѕ?", word: "der KГјhlschrank", options: ["РџР»РёС‚Р°", "РҐРѕР»РѕРґРёР»СЊРЅРёРє", "РЁРєР°С„", "Р Р°РєРѕРІРёРЅР°"], correct: 1, hint: "kГјhl вЂ” РїСЂРѕС…Р»Р°РґРЅС‹Р№" },
  { id: 40, level: "A1", type: "translate", category: "Р”РѕРј", prompt: "РљР°Рє РїРµСЂРµРІРѕРґРёС‚СЃСЏ СЃР»РѕРІРѕ?", word: "das Fenster", options: ["Р”РІРµСЂСЊ", "РЎС‚РµРЅР°", "РћРєРЅРѕ", "РџРѕС‚РѕР»РѕРє"], correct: 2, hint: "Р§РµСЂРµР· РЅРµРіРѕ СЃРІРµС‚РёС‚ СЃРѕР»РЅС†Рµ" },
  { id: 41, level: "A1", type: "translate", category: "Р”РѕРј", prompt: "РљР°Рє РїРµСЂРµРІРѕРґРёС‚СЃСЏ СЃР»РѕРІРѕ?", word: "der Stuhl", options: ["РЎС‚РѕР»", "РљСЂРѕРІР°С‚СЊ", "Р”РёРІР°РЅ", "РЎС‚СѓР»"], correct: 3, hint: "РќР° РЅС‘Рј СЃРёРґСЏС‚" },
  { id: 42, level: "A1", type: "translate", category: "Р”РѕРј", prompt: "РљР°Рє РїРµСЂРµРІРѕРґРёС‚СЃСЏ СЃР»РѕРІРѕ?", word: "die Treppe", options: ["Р›РёС„С‚", "Р›РµСЃС‚РЅРёС†Р°", "РљРѕСЂРёРґРѕСЂ", "Р‘Р°Р»РєРѕРЅ"], correct: 1, hint: "РџРѕ РЅРµР№ РїРѕРґРЅРёРјР°СЋС‚СЃСЏ РЅР° СЌС‚Р°Р¶" },
  { id: 43, level: "A1", type: "translate", category: "Р§СѓРІСЃС‚РІР°", prompt: "РљР°Рє РїРµСЂРµРІРѕРґРёС‚СЃСЏ СЃР»РѕРІРѕ?", word: "die Freude", options: ["Р“СЂСѓСЃС‚СЊ", "РЎС‚СЂР°С…", "Р Р°РґРѕСЃС‚СЊ", "Р—Р»РѕСЃС‚СЊ"], correct: 2, hint: "РљРѕРіРґР° РІСЃС‘ С…РѕСЂРѕС€Рѕ" },
  { id: 44, level: "A1", type: "translate", category: "Р§СѓРІСЃС‚РІР°", prompt: "РљР°Рє РїРµСЂРµРІРѕРґРёС‚СЃСЏ СЃР»РѕРІРѕ?", word: "die Angst", options: ["Р‘РѕР»СЊ", "РЎС‚СЂР°С…", "РЈСЃС‚Р°Р»РѕСЃС‚СЊ", "РЎРєСѓРєР°"], correct: 1, hint: "РќРµРїСЂРёСЏС‚РЅРѕРµ С‡СѓРІСЃС‚РІРѕ РїРµСЂРµРґ РѕРїР°СЃРЅРѕСЃС‚СЊСЋ" },

  // A1 вЂ” РђСЂС‚РёРєР»Рё (Р±Р°Р·РѕРІС‹Рµ)
  { id: 45, level: "A1", type: "fill", category: "Р“СЂР°РјРјР°С‚РёРєР°", prompt: "Р’С‹Р±РµСЂРё РїСЂР°РІРёР»СЊРЅС‹Р№ Р°СЂС‚РёРєР»СЊ:", word: "___ Hund bellt laut.", options: ["Der", "Die", "Das", "Dem"], correct: 0, hint: "Hund вЂ” РјСѓР¶СЃРєРѕР№ СЂРѕРґ" },
  { id: 46, level: "A1", type: "fill", category: "Р“СЂР°РјРјР°С‚РёРєР°", prompt: "Р’С‹Р±РµСЂРё РїСЂР°РІРёР»СЊРЅС‹Р№ Р°СЂС‚РёРєР»СЊ:", word: "___ Sonne scheint.", options: ["Der", "Die", "Das", "Den"], correct: 1, hint: "Sonne вЂ” Р¶РµРЅСЃРєРёР№ СЂРѕРґ" },
  { id: 47, level: "A1", type: "fill", category: "Р“СЂР°РјРјР°С‚РёРєР°", prompt: "Р’С‹Р±РµСЂРё РїСЂР°РІРёР»СЊРЅС‹Р№ Р°СЂС‚РёРєР»СЊ:", word: "___ Kind spielt.", options: ["Der", "Die", "Das", "Dem"], correct: 2, hint: "Kind вЂ” СЃСЂРµРґРЅРёР№ СЂРѕРґ" },
  { id: 48, level: "A1", type: "fill", category: "Р“СЂР°РјРјР°С‚РёРєР°", prompt: "Р’С‹Р±РµСЂРё РїСЂР°РІРёР»СЊРЅС‹Р№ Р°СЂС‚РёРєР»СЊ:", word: "___ Buch ist interessant.", options: ["Der", "Die", "Das", "Dem"], correct: 2, hint: "Buch вЂ” СЃСЂРµРґРЅРёР№ СЂРѕРґ" },
  { id: 49, level: "A1", type: "fill", category: "Р“СЂР°РјРјР°С‚РёРєР°", prompt: "Р’С‹Р±РµСЂРё РїСЂР°РІРёР»СЊРЅС‹Р№ Р°СЂС‚РёРєР»СЊ:", word: "___ Katze schlГ¤ft.", options: ["Der", "Die", "Das", "Den"], correct: 1, hint: "Katze вЂ” Р¶РµРЅСЃРєРёР№ СЂРѕРґ" },
  { id: 50, level: "A1", type: "fill", category: "Р“СЂР°РјРјР°С‚РёРєР°", prompt: "Р’С‹Р±РµСЂРё РїСЂР°РІРёР»СЊРЅС‹Р№ Р°СЂС‚РёРєР»СЊ:", word: "___ Wasser ist kalt.", options: ["Der", "Die", "Das", "Den"], correct: 2, hint: "Wasser вЂ” СЃСЂРµРґРЅРёР№ СЂРѕРґ" },
  { id: 51, level: "A1", type: "choose", category: "Р“СЂР°РјРјР°С‚РёРєР°", prompt: "РљР°РєРѕРµ РїСЂРµРґР»РѕР¶РµРЅРёРµ РіСЂР°РјРјР°С‚РёС‡РµСЃРєРё РІРµСЂРЅРѕ?", word: null, options: ["Ich gehe morgen zur Schule.", "Ich gehen morgen zur Schule.", "Ich geht morgen zur Schule.", "Ich gehst morgen zur Schule."], correct: 0, hint: "Ich в†’ РїРµСЂРІРѕРµ Р»РёС†Рѕ РµРґ. С‡РёСЃР»Р° в†’ gehe" },
  { id: 52, level: "A1", type: "choose", category: "Р“СЂР°РјРјР°С‚РёРєР°", prompt: "РљР°РєРѕРµ РїСЂРµРґР»РѕР¶РµРЅРёРµ РіСЂР°РјРјР°С‚РёС‡РµСЃРєРё РІРµСЂРЅРѕ?", word: null, options: ["Er haben ein Auto.", "Er hat ein Auto.", "Er habe ein Auto.", "Er hast ein Auto."], correct: 1, hint: "er/sie/es в†’ hat" },
  { id: 53, level: "A1", type: "choose", category: "Р“СЂР°РјРјР°С‚РёРєР°", prompt: "РљР°РєРѕРµ РїСЂРµРґР»РѕР¶РµРЅРёРµ РіСЂР°РјРјР°С‚РёС‡РµСЃРєРё РІРµСЂРЅРѕ?", word: null, options: ["Wir spielen FuГџball.", "Wir spielt FuГџball.", "Wir spielst FuГџball.", "Wir spielen FuГџballe."], correct: 0, hint: "wir в†’ spielen (РѕРєРѕРЅС‡Р°РЅРёРµ -en)" },

  // A2 вЂ” РЎР»РѕР¶РЅС‹Рµ С‚РµРјС‹
  { id: 54, level: "A2", type: "translate", category: "Р§СѓРІСЃС‚РІР°", prompt: "РљР°Рє РїРµСЂРµРІРѕРґРёС‚СЃСЏ СЃР»РѕРІРѕ?", word: "die Sehnsucht", options: ["Р Р°РґРѕСЃС‚СЊ", "РЎРєСѓРєР°", "РўРѕСЃРєР°", "Р—Р»РѕСЃС‚СЊ"], correct: 2, hint: "Р“Р»СѓР±РѕРєРѕРµ С‚РѕСЃРєР»РёРІРѕРµ Р¶РµР»Р°РЅРёРµ" },
  { id: 55, level: "A2", type: "translate", category: "Р’СЂРµРјСЏ", prompt: "РљР°Рє РїРµСЂРµРІРѕРґРёС‚СЃСЏ СЃР»РѕРІРѕ?", word: "das Jahrhundert", options: ["Р“РѕРґ", "Р”РµСЃСЏС‚РёР»РµС‚РёРµ", "Р’РµРє", "РњРѕРјРµРЅС‚"], correct: 2, hint: "100 Р»РµС‚" },
  { id: 56, level: "A2", type: "translate", category: "Р’СЂРµРјСЏ", prompt: "РљР°Рє РїРµСЂРµРІРѕРґРёС‚СЃСЏ СЃР»РѕРІРѕ?", word: "die Zukunft", options: ["РџСЂРѕС€Р»РѕРµ", "РќР°СЃС‚РѕСЏС‰РµРµ", "Р‘СѓРґСѓС‰РµРµ", "РСЃС‚РѕСЂРёСЏ"], correct: 2, hint: "РўРѕ, С‡С‚Рѕ РµС‰С‘ РЅРµ СЃР»СѓС‡РёР»РѕСЃСЊ" },
  { id: 57, level: "A2", type: "translate", category: "Р’СЂРµРјСЏ", prompt: "РљР°Рє РїРµСЂРµРІРѕРґРёС‚СЃСЏ СЃР»РѕРІРѕ?", word: "gestern", options: ["РЎРµРіРѕРґРЅСЏ", "Р—Р°РІС‚СЂР°", "Р’С‡РµСЂР°", "РќРµРґР°РІРЅРѕ"], correct: 2, hint: "Р”РµРЅСЊ РґРѕ СЃРµРіРѕРґРЅСЏС€РЅРµРіРѕ" },
  { id: 58, level: "A2", type: "translate", category: "Р“РѕСЂРѕРґ", prompt: "РљР°Рє РїРµСЂРµРІРѕРґРёС‚СЃСЏ СЃР»РѕРІРѕ?", word: "das Rathaus", options: ["РўСЋСЂСЊРјР°", "Р Р°С‚СѓС€Р°", "Р¦РµСЂРєРѕРІСЊ", "Р—Р°РјРѕРє"], correct: 1, hint: "Р¦РµРЅС‚СЂ РіРѕСЂРѕРґСЃРєРѕРіРѕ СѓРїСЂР°РІР»РµРЅРёСЏ" },
  { id: 59, level: "A2", type: "translate", category: "Р”РѕРј", prompt: "РљР°Рє РїРµСЂРµРІРѕРґРёС‚СЃСЏ СЃР»РѕРІРѕ?", word: "das Schloss", options: ["РљР»СЋС‡", "Р”РІРµСЂСЊ", "Р—Р°РјРѕРє", "РћРєРЅРѕ"], correct: 2, hint: "РњРѕР¶РµС‚ Р±С‹С‚СЊ Рё РґРІРѕСЂС†РѕРј, Рё Р·Р°РјРєРѕРј РЅР° РґРІРµСЂРё" },
  { id: 60, level: "A2", type: "fill", category: "Р“СЂР°РјРјР°С‚РёРєР°", prompt: "Р’С‹Р±РµСЂРё РїСЂР°РІРёР»СЊРЅС‹Р№ Р°СЂС‚РёРєР»СЊ:", word: "Ich sehe ___ Mann.", options: ["der", "die", "das", "den"], correct: 3, hint: "Akkusativ, РјСѓР¶СЃРєРѕР№ СЂРѕРґ в†’ den" },
  { id: 61, level: "A2", type: "fill", category: "Р“СЂР°РјРјР°С‚РёРєР°", prompt: "Р’С‹Р±РµСЂРё РїСЂР°РІРёР»СЊРЅС‹Р№ Р°СЂС‚РёРєР»СЊ:", word: "Sie hilft ___ Frau.", options: ["der", "die", "das", "den"], correct: 0, hint: "Dativ, Р¶РµРЅСЃРєРёР№ СЂРѕРґ в†’ der" },
  { id: 62, level: "A2", type: "fill", category: "Р“СЂР°РјРјР°С‚РёРєР°", prompt: "Р’С‹Р±РµСЂРё РїСЂР°РІРёР»СЊРЅС‹Р№ Р°СЂС‚РёРєР»СЊ:", word: "Ich kaufe ___ Apfel.", options: ["der", "die", "den", "das"], correct: 2, hint: "Akkusativ, РјСѓР¶СЃРєРѕР№ СЂРѕРґ в†’ den" },
  { id: 63, level: "A2", type: "fill", category: "Р“СЂР°РјРјР°С‚РёРєР°", prompt: "Р’С‹Р±РµСЂРё РїСЂР°РІРёР»СЊРЅС‹Р№ Р°СЂС‚РёРєР»СЊ:", word: "Er gibt ___ Kind ein Geschenk.", options: ["der", "die", "dem", "das"], correct: 2, hint: "Dativ, СЃСЂРµРґРЅРёР№ СЂРѕРґ в†’ dem" },
  { id: 64, level: "A2", type: "choose", category: "Р“СЂР°РјРјР°С‚РёРєР°", prompt: "Р’С‹Р±РµСЂРё РїСЂР°РІРёР»СЊРЅС‹Р№ РїРѕСЂСЏРґРѕРє СЃР»РѕРІ:", word: null, options: ["Morgen ich gehe ins Kino.", "Ich morgen gehe ins Kino.", "Morgen gehe ich ins Kino.", "Ins Kino ich gehe morgen."], correct: 2, hint: "Р•СЃР»Рё РЅР°СЂРµС‡РёРµ РІ РЅР°С‡Р°Р»Рµ вЂ” РіР»Р°РіРѕР» РЅР° 2-Рј РјРµСЃС‚Рµ" },
  { id: 65, level: "A2", type: "choose", category: "Р“СЂР°РјРјР°С‚РёРєР°", prompt: "РљР°Рє РїСЂР°РІРёР»СЊРЅРѕ СЃРєР°Р·Р°С‚СЊ РІ РїСЂРѕС€РµРґС€РµРј РІСЂРµРјРµРЅРё?", word: null, options: ["Ich habe geschlafen.", "Ich bin geschlafen.", "Ich habe schlafe.", "Ich war schlafe."], correct: 0, hint: "schlafen в†’ Perfekt СЃ haben" },
  { id: 66, level: "A2", type: "choose", category: "Р“СЂР°РјРјР°С‚РёРєР°", prompt: "РљР°РєРѕРµ РїСЂРµРґР»РѕР¶РµРЅРёРµ РІРµСЂРЅРѕ?", word: null, options: ["Ich bin gegangen.", "Ich habe gegangen.", "Ich war gehen.", "Ich bin gehe."], correct: 0, hint: "gehen в†’ Perfekt СЃ sein" },
  { id: 67, level: "A2", type: "choose", category: "Р“СЂР°РјРјР°С‚РёРєР°", prompt: "Р’С‹Р±РµСЂРё РїСЂР°РІРёР»СЊРЅС‹Р№ РІР°СЂРёР°РЅС‚:", word: null, options: ["Er kommt aus Deutschland.", "Er kommt von Deutschland.", "Er kommt aus der Deutschland.", "Er kommt von der Deutschland."], correct: 0, hint: "aus + СЃС‚СЂР°РЅР° Р±РµР· Р°СЂС‚РёРєР»СЏ" },
  { id: 68, level: "A2", type: "choose", category: "Р“СЂР°РјРјР°С‚РёРєР°", prompt: "РљР°РєРѕРµ РїСЂРµРґР»РѕР¶РµРЅРёРµ РіСЂР°РјРјР°С‚РёС‡РµСЃРєРё РІРµСЂРЅРѕ?", word: null, options: ["Ich mГ¶chte Kaffee trinken.", "Ich mГ¶chte Kaffee trinkst.", "Ich mГ¶chte Kaffee trinkt.", "Ich mГ¶chten Kaffee trinken."], correct: 0, hint: "РњРѕРґР°Р»СЊРЅС‹Р№ РіР»Р°РіРѕР» + РёРЅС„РёРЅРёС‚РёРІ РІ РєРѕРЅС†Рµ" },
  { id: 69, level: "A2", type: "choose", category: "Р“СЂР°РјРјР°С‚РёРєР°", prompt: "РљР°РєРѕРµ РїСЂРµРґР»РѕР¶РµРЅРёРµ РіСЂР°РјРјР°С‚РёС‡РµСЃРєРё РІРµСЂРЅРѕ?", word: null, options: ["Du gehst ins Kino?", "Du gehst im Kino?", "Du gehen ins Kino?", "Du geht ins Kino?"], correct: 0, hint: "du в†’ gehst; ins = in das" },
];

// Р’РѕРїСЂРѕСЃС‹ РґР»СЏ С‚РµСЃС‚Р° РЅР° РѕРїСЂРµРґРµР»РµРЅРёРµ СѓСЂРѕРІРЅСЏ
const PLACEMENT_TEST = [
  { id: "p1", prompt: "Р§С‚Рѕ Р·РЅР°С‡РёС‚ В«HalloВ»?", options: ["РџРѕРєР°", "РџСЂРёРІРµС‚", "РЎРїР°СЃРёР±Рѕ", "Р”Р°"], correct: 1, hint: null },
  { id: "p2", prompt: "Р§С‚Рѕ Р·РЅР°С‡РёС‚ В«zweiВ»?", options: ["РћРґРёРЅ", "РўСЂРё", "Р”РІР°", "РџСЏС‚СЊ"], correct: 2, hint: null },
  { id: "p3", prompt: "Р§С‚Рѕ Р·РЅР°С‡РёС‚ В«groГџВ»?", options: ["РњР°Р»РµРЅСЊРєРёР№", "Р‘С‹СЃС‚СЂС‹Р№", "РЎС‚Р°СЂС‹Р№", "Р‘РѕР»СЊС€РѕР№"], correct: 3, hint: null },
  { id: "p4", prompt: "Р’С‹Р±РµСЂРё РїСЂР°РІРёР»СЊРЅС‹Р№ Р°СЂС‚РёРєР»СЊ: ___ Hund", options: ["Die", "Das", "Der", "Den"], correct: 2, hint: null },
  { id: "p5", prompt: "Р§С‚Рѕ Р·РЅР°С‡РёС‚ В«der BahnhofВ»?", options: ["РђСЌСЂРѕРїРѕСЂС‚", "Р’РѕРєР·Р°Р»", "РњР°РіР°Р·РёРЅ", "РЁРєРѕР»Р°"], correct: 1, hint: null },
  { id: "p6", prompt: "РљР°РєРѕРµ РїСЂРµРґР»РѕР¶РµРЅРёРµ РІРµСЂРЅРѕ?", options: ["Ich gehen zur Schule.", "Ich geht zur Schule.", "Ich gehe zur Schule.", "Ich gehst zur Schule."], correct: 2, hint: null },
  { id: "p7", prompt: "Р§С‚Рѕ Р·РЅР°С‡РёС‚ В«die ZukunftВ»?", options: ["РџСЂРѕС€Р»РѕРµ", "РќР°СЃС‚РѕСЏС‰РµРµ", "Р‘СѓРґСѓС‰РµРµ", "Р’СЂРµРјСЏ"], correct: 2, hint: null },
  { id: "p8", prompt: "Р’С‹Р±РµСЂРё РїСЂР°РІРёР»СЊРЅС‹Р№ Р°СЂС‚РёРєР»СЊ: Ich sehe ___ Mann.", options: ["der", "die", "das", "den"], correct: 3, hint: null },
  { id: "p9", prompt: "РљР°Рє СЃРєР°Р·Р°С‚СЊ В«СЏ С…РѕРґРёР»В» (Perfekt)?", options: ["Ich war gehen.", "Ich habe gegangen.", "Ich bin gegangen.", "Ich gehe gegangen."], correct: 2, hint: null },
  { id: "p10", prompt: "Р’С‹Р±РµСЂРё РїСЂР°РІРёР»СЊРЅС‹Р№ РїРѕСЂСЏРґРѕРє СЃР»РѕРІ:", options: ["Morgen ich gehe ins Kino.", "Morgen gehe ich ins Kino.", "Ich gehe morgen ins Kino immer.", "Ins Kino morgen ich gehe."], correct: 1, hint: null },
];

const LEVEL_FROM_SCORE = (score) => {
  if (score <= 3) return "A0";
  if (score <= 6) return "A1";
  return "A2";
};

const LEVEL_INFO = {
  A0: { label: "A0 В· РќР°С‡РёРЅР°СЋС‰РёР№", color: "#10b981", desc: "Р‘Р°Р·РѕРІС‹Рµ СЃР»РѕРІР° Рё С„СЂР°Р·С‹" },
  A1: { label: "A1 В· Р­Р»РµРјРµРЅС‚Р°СЂРЅС‹Р№", color: "#7C5CFC", desc: "РџСЂРѕСЃС‚Р°СЏ Р»РµРєСЃРёРєР° Рё Р°СЂС‚РёРєР»Рё" },
  A2: { label: "A2 В· Р‘Р°Р·РѕРІС‹Р№", color: "#f59e0b", desc: "Р“СЂР°РјРјР°С‚РёРєР° Рё РїР°РґРµР¶Рё" },
};

const CATEGORIES_BY_LEVEL = {
  A0: ["РћСЃРЅРѕРІС‹"],
  A1: ["РџСЂРёСЂРѕРґР°", "Р•РґР°", "Р“РѕСЂРѕРґ", "Р”РѕРј", "Р§СѓРІСЃС‚РІР°", "Р“СЂР°РјРјР°С‚РёРєР°"],
  A2: ["Р§СѓРІСЃС‚РІР°", "Р’СЂРµРјСЏ", "Р“РѕСЂРѕРґ", "Р”РѕРј", "Р“СЂР°РјРјР°С‚РёРєР°"],
};

const CATEGORY_ICONS = { "РћСЃРЅРѕРІС‹": "рџ”¤", "РџСЂРёСЂРѕРґР°": "рџЊї", "Р•РґР°": "рџЌћ", "Р“РѕСЂРѕРґ": "рџЏ™пёЏ", "Р”РѕРј": "рџЏ ", "Р§СѓРІСЃС‚РІР°": "рџ’њ", "Р“СЂР°РјРјР°С‚РёРєР°": "рџ“ќ", "Р’СЂРµРјСЏ": "вЏі" };
const PARTNER = { name: "Maria", avatar: "рџ§‘вЂЌрџЋ¤", level: "A2" };
const QUESTIONS_PER_ROUND = 8;

function getLevel(xp) { return Math.floor(xp / 200) + 1; }
function xpToNextLevel(xp) { return 200 - (xp % 200); }
function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5); }

// в”Ђв”Ђ РџР РћР“Р РђРњРњРђ РћР‘РЈР§Р•РќРРЇ в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ
const CURRICULUM_LEVELS = {
  A1: { color: "#7C5CFC", label: "A1 В· РќР°С‡РёРЅР°СЋС‰РёР№" },
  A2: { color: "#f59e0b", label: "A2 В· Р‘Р°Р·РѕРІС‹Р№" },
};

const CURRICULUM = [
  {
    id: "greetings",
    title: "РџСЂРёРІРµС‚СЃС‚РІРёСЏ",
    emoji: "рџ‘‹",
    level: "A1",
    cards: [
      { title: "РљР°Рє РїРѕР·РґРѕСЂРѕРІР°С‚СЊСЃСЏ", body: "Hallo вЂ” РџСЂРёРІРµС‚\nGuten Morgen вЂ” Р”РѕР±СЂРѕРµ СѓС‚СЂРѕ\nGuten Tag вЂ” Р”РѕР±СЂС‹Р№ РґРµРЅСЊ\nGuten Abend вЂ” Р”РѕР±СЂС‹Р№ РІРµС‡РµСЂ\nHi вЂ” РҐР°Р№ (РЅРµС„РѕСЂРјР°Р»СЊРЅРѕ)" },
      { title: "РљР°Рє РїРѕРїСЂРѕС‰Р°С‚СЊСЃСЏ", body: "TschГјss вЂ” РџРѕРєР°\nAuf Wiedersehen вЂ” Р”Рѕ СЃРІРёРґР°РЅРёСЏ\nBis bald вЂ” Р”Рѕ СЃРєРѕСЂРѕРіРѕ\nBis morgen вЂ” Р”Рѕ Р·Р°РІС‚СЂР°\nGute Nacht вЂ” РЎРїРѕРєРѕР№РЅРѕР№ РЅРѕС‡Рё" },
      { title: "РљР°Рє СЃРїСЂРѕСЃРёС‚СЊ В«РєР°Рє РґРµР»Р°В»", body: "Wie geht es Ihnen? вЂ” РљР°Рє РІС‹ РїРѕР¶РёРІР°РµС‚Рµ? (РѕС„РёС†РёР°Р»СЊРЅРѕ)\nWie geht's? вЂ” РљР°Рє РґРµР»Р°? (РЅРµС„РѕСЂРјР°Р»СЊРЅРѕ)\n\nРћС‚РІРµС‚С‹:\nGut, danke! вЂ” РҐРѕСЂРѕС€Рѕ, СЃРїР°СЃРёР±Рѕ!\nSehr gut! вЂ” РћС‡РµРЅСЊ С…РѕСЂРѕС€Рѕ!\nEs geht. вЂ” РќРѕСЂРјР°Р»СЊРЅРѕ.\nNicht so gut. вЂ” РќРµ РѕС‡РµРЅСЊ." },
    ],
    exam: [
      { q: "РљР°Рє СЃРєР°Р·Р°С‚СЊ В«Р”РѕР±СЂС‹Р№ РґРµРЅСЊВ» РїРѕ-РЅРµРјРµС†РєРё?", options: ["Guten Tag", "Gute Nacht", "Auf Wiedersehen", "TschГјss"], answer: 0 },
      { q: "Р§С‚Рѕ Р·РЅР°С‡РёС‚ В«TschГјssВ»?", options: ["РџСЂРёРІРµС‚", "РџРѕРєР°", "РЎРїР°СЃРёР±Рѕ", "РџРѕР¶Р°Р»СѓР№СЃС‚Р°"], answer: 1 },
      { q: "РљР°Рє РЅРµС„РѕСЂРјР°Р»СЊРЅРѕ СЃРїСЂРѕСЃРёС‚СЊ В«РєР°Рє РґРµР»Р°В»?", options: ["Wie heiГџen Sie?", "Woher kommen Sie?", "Wie geht's?", "Was machen Sie?"], answer: 2 },
      { q: "В«Bis baldВ» РѕР·РЅР°С‡Р°РµС‚:", options: ["Р”Рѕ Р·Р°РІС‚СЂР°", "Р”Рѕ СЃРІРёРґР°РЅРёСЏ", "Р”Рѕ СЃРєРѕСЂРѕРіРѕ", "РЎРїРѕРєРѕР№РЅРѕР№ РЅРѕС‡Рё"], answer: 2 },
      { q: "РљР°Рє РѕС‚РІРµС‚РёС‚СЊ В«РћС‡РµРЅСЊ С…РѕСЂРѕС€РѕВ»?", options: ["Es geht.", "Nicht so gut.", "Danke schГ¶n.", "Sehr gut!"], answer: 3 },
    ],
  },
  {
    id: "articles",
    title: "РђСЂС‚РёРєР»Рё",
    emoji: "рџ“Њ",
    level: "A1",
    cards: [
      { title: "РўСЂРё СЂРѕРґР° РІ РЅРµРјРµС†РєРѕРј", body: "Р’ РЅРµРјРµС†РєРѕРј Сѓ РєР°Р¶РґРѕРіРѕ СЃСѓС‰РµСЃС‚РІРёС‚РµР»СЊРЅРѕРіРѕ РµСЃС‚СЊ СЂРѕРґ:\n\nder вЂ” РјСѓР¶СЃРєРѕР№ (der Mann, der Tisch)\ndie вЂ” Р¶РµРЅСЃРєРёР№ (die Frau, die TГјr)\ndas вЂ” СЃСЂРµРґРЅРёР№ (das Kind, das Buch)\n\nрџ’Ў Р РѕРґ РЅР°РґРѕ СѓС‡РёС‚СЊ РІРјРµСЃС‚Рµ СЃРѕ СЃР»РѕРІРѕРј вЂ” РїСЂР°РІРёР» РјР°Р»Рѕ!" },
      { title: "РќРµРѕРїСЂРµРґРµР»С‘РЅРЅС‹Р№ Р°СЂС‚РёРєР»СЊ", body: "ein/eine вЂ” В«РѕРґРёРЅ, РѕРґРЅР°В» (РєР°Рє В«a/anВ» РІ Р°РЅРіР»РёР№СЃРєРѕРј)\n\nein Mann вЂ” РјСѓР¶С‡РёРЅР°\neine Frau вЂ” Р¶РµРЅС‰РёРЅР°\nein Kind вЂ” СЂРµР±С‘РЅРѕРє\n\nвљ пёЏ Р”Р»СЏ РјСѓР¶СЃРєРѕРіРѕ Рё СЃСЂРµРґРЅРµРіРѕ: ein\nР”Р»СЏ Р¶РµРЅСЃРєРѕРіРѕ: eine" },
      { title: "РљРѕРіРґР° Р°СЂС‚РёРєР»СЊ РЅРµ РЅСѓР¶РµРЅ", body: "РђСЂС‚РёРєР»СЊ РЅРµ СЃС‚Р°РІРёС‚СЃСЏ:\n\nвЂў РџРµСЂРµРґ РёРјРµРЅР°РјРё: Das ist Anna.\nвЂў РџРµСЂРµРґ РїСЂРѕС„РµСЃСЃРёСЏРјРё: Ich bin Lehrerin.\nвЂў РџРµСЂРµРґ СЃС‚СЂР°РЅР°РјРё: Ich komme aus Deutschland.\n\nрџ’Ў РСЃРєР»СЋС‡РµРЅРёРµ: die Schweiz, die TГјrkei вЂ” СЃ Р°СЂС‚РёРєР»РµРј!" },
    ],
    exam: [
      { q: "РљР°РєРѕР№ Р°СЂС‚РёРєР»СЊ Сѓ СЃР»РѕРІР° В«TischВ» (СЃС‚РѕР»)?", options: ["die", "das", "der", "ein"], answer: 2 },
      { q: "РљР°РєРѕР№ Р°СЂС‚РёРєР»СЊ Сѓ СЃР»РѕРІР° В«FrauВ» (Р¶РµРЅС‰РёРЅР°)?", options: ["der", "die", "das", "einen"], answer: 1 },
      { q: "РљР°РєРѕР№ Р°СЂС‚РёРєР»СЊ Сѓ СЃР»РѕРІР° В«KindВ» (СЂРµР±С‘РЅРѕРє)?", options: ["der", "die", "das", "eine"], answer: 2 },
      { q: "В«Eine FrauВ» вЂ” СЌС‚Рѕ:", options: ["РћРїСЂРµРґРµР»С‘РЅРЅС‹Р№ Р°СЂС‚РёРєР»СЊ", "РќРµРѕРїСЂРµРґРµР»С‘РЅРЅС‹Р№ Р°СЂС‚РёРєР»СЊ", "Р‘РµР· Р°СЂС‚РёРєР»СЏ", "РџСЂРёС‚СЏР¶Р°С‚РµР»СЊРЅС‹Р№"], answer: 1 },
      { q: "РџРµСЂРµРґ РїСЂРѕС„РµСЃСЃРёРµР№ Р°СЂС‚РёРєР»СЊ:", options: ["der", "die", "das", "РЅРµ СЃС‚Р°РІРёС‚СЃСЏ"], answer: 3 },
    ],
  },
  {
    id: "numbers",
    title: "Р§РёСЃР»Р° 1вЂ“20",
    emoji: "рџ”ў",
    level: "A1",
    cards: [
      { title: "Р§РёСЃР»Р° 1вЂ“10", body: "1 вЂ” eins\n2 вЂ” zwei\n3 вЂ” drei\n4 вЂ” vier\n5 вЂ” fГјnf\n6 вЂ” sechs\n7 вЂ” sieben\n8 вЂ” acht\n9 вЂ” neun\n10 вЂ” zehn" },
      { title: "Р§РёСЃР»Р° 11вЂ“20", body: "11 вЂ” elf\n12 вЂ” zwГ¶lf\n13 вЂ” dreizehn\n14 вЂ” vierzehn\n15 вЂ” fГјnfzehn\n16 вЂ” sechzehn\n17 вЂ” siebzehn\n18 вЂ” achtzehn\n19 вЂ” neunzehn\n20 вЂ” zwanzig\n\nрџ’Ў 13-19: РїСЂРѕСЃС‚Рѕ РґРѕР±Р°РІР»СЏР№ -zehn (= В«-РЅР°РґС†Р°С‚СЊВ»)" },
      { title: "Р§РёСЃР»Р° 21вЂ“100", body: "21 вЂ” einundzwanzig\n30 вЂ” dreiГџig\n40 вЂ” vierzig\n50 вЂ” fГјnfzig\n100 вЂ” hundert\n\nрџ’Ў Р’ РЅРµРјРµС†РєРѕРј РїРѕСЂСЏРґРѕРє РѕР±СЂР°С‚РЅС‹Р№:\n25 = fГјnfundzwanzig (РїСЏС‚СЊ-Рё-РґРІР°РґС†Р°С‚СЊ)\nРљР°Рє СЃС‚Р°СЂРѕСЂСѓСЃСЃРєРѕРµ В«РїСЏС‚СЊ РґР° РґРІР°РґС†Р°С‚СЊВ»!" },
    ],
    exam: [
      { q: "РљР°Рє РїРѕ-РЅРµРјРµС†РєРё В«СЃРµРјСЊВ»?", options: ["sechs", "acht", "sieben", "neun"], answer: 2 },
      { q: "Р§С‚Рѕ Р·РЅР°С‡РёС‚ В«zwГ¶lfВ»?", options: ["11", "12", "13", "20"], answer: 1 },
      { q: "РљР°Рє Р±СѓРґРµС‚ В«РїСЏС‚РЅР°РґС†Р°С‚СЊВ»?", options: ["fГјnfzehn", "fГјnfzig", "fГјnfundzwanzig", "fГјnf"], answer: 0 },
      { q: "В«DreiГџigВ» вЂ” СЌС‚Рѕ:", options: ["13", "30", "33", "300"], answer: 1 },
      { q: "РљР°Рє СЃРєР°Р·Р°С‚СЊ В«РґРІР°РґС†Р°С‚СЊ РѕРґРёРЅВ»?", options: ["zwanzigeins", "einzwanzig", "einundzwanzig", "zwanzigeiner"], answer: 2 },
    ],
  },
  {
    id: "family",
    title: "РЎРµРјСЊСЏ",
    emoji: "рџ‘ЁвЂЌрџ‘©вЂЌрџ‘§",
    level: "A1",
    cards: [
      { title: "Р§Р»РµРЅС‹ СЃРµРјСЊРё", body: "der Vater вЂ” РїР°РїР°\ndie Mutter вЂ” РјР°РјР°\nder Bruder вЂ” Р±СЂР°С‚\ndie Schwester вЂ” СЃРµСЃС‚СЂР°\nder Sohn вЂ” СЃС‹РЅ\ndie Tochter вЂ” РґРѕС‡СЊ\ndie Eltern вЂ” СЂРѕРґРёС‚РµР»Рё (РјРЅ.С‡.)\ndie Kinder вЂ” РґРµС‚Рё (РјРЅ.С‡.)" },
      { title: "Р Р°СЃС€РёСЂРµРЅРЅР°СЏ СЃРµРјСЊСЏ", body: "der GroГџvater / Opa вЂ” РґРµРґСѓС€РєР°\ndie GroГџmutter / Oma вЂ” Р±Р°Р±СѓС€РєР°\nder Onkel вЂ” РґСЏРґСЏ\ndie Tante вЂ” С‚С‘С‚СЏ\nder Cousin вЂ” РґРІРѕСЋСЂРѕРґРЅС‹Р№ Р±СЂР°С‚\ndie Cousine вЂ” РґРІРѕСЋСЂРѕРґРЅР°СЏ СЃРµСЃС‚СЂР°\nder Mann вЂ” РјСѓР¶\ndie Frau вЂ” Р¶РµРЅР°" },
      { title: "РљР°Рє СЂР°СЃСЃРєР°Р·Р°С‚СЊ Рѕ СЃРµРјСЊРµ", body: "Ich habe... вЂ” РЈ РјРµРЅСЏ РµСЃС‚СЊ...\nIch habe einen Bruder. вЂ” РЈ РјРµРЅСЏ РµСЃС‚СЊ Р±СЂР°С‚.\nIch habe keine Geschwister. вЂ” РЈ РјРµРЅСЏ РЅРµС‚ Р±СЂР°С‚СЊРµРІ Рё СЃРµСЃС‚С‘СЂ.\n\nMeine Familie ist groГџ/klein.\nРњРѕСЏ СЃРµРјСЊСЏ Р±РѕР»СЊС€Р°СЏ/РјР°Р»РµРЅСЊРєР°СЏ.\n\nGeschwister = Р±СЂР°С‚СЊСЏ Рё СЃС‘СЃС‚СЂС‹ РІРјРµСЃС‚Рµ" },
    ],
    exam: [
      { q: "РљР°Рє РїРѕ-РЅРµРјРµС†РєРё В«РґРѕС‡СЊВ»?", options: ["der Sohn", "die Tochter", "die Schwester", "die Mutter"], answer: 1 },
      { q: "В«Die ElternВ» вЂ” СЌС‚Рѕ:", options: ["РґРµС‚Рё", "СЂРѕРґРёС‚РµР»Рё", "Р±Р°Р±СѓС€РєРё Рё РґРµРґСѓС€РєРё", "С‚С‘С‚Рё Рё РґСЏРґРё"], answer: 1 },
      { q: "РљР°Рє СЃРєР°Р·Р°С‚СЊ В«РЈ РјРµРЅСЏ РµСЃС‚СЊ СЃРµСЃС‚СЂР°В»?", options: ["Ich bin eine Schwester.", "Ich habe eine Schwester.", "Ich habe einen Schwester.", "Mein Schwester."], answer: 1 },
      { q: "В«OpaВ» вЂ” СЌС‚Рѕ СЂР°Р·РіРѕРІРѕСЂРЅРѕРµ СЃР»РѕРІРѕ РґР»СЏ:", options: ["РїР°РїС‹", "РґСЏРґРё", "РґРµРґСѓС€РєРё", "Р±СЂР°С‚Р°"], answer: 2 },
      { q: "В«GeschwisterВ» Р·РЅР°С‡РёС‚:", options: ["СЃРµСЃС‚СЂР°", "Р±СЂР°С‚", "Р±СЂР°С‚СЊСЏ Рё СЃС‘СЃС‚СЂС‹", "СЂРѕРґРёС‚РµР»Рё"], answer: 2 },
    ],
  },
  {
    id: "colors",
    title: "Р¦РІРµС‚Р°",
    emoji: "рџЋЁ",
    level: "A1",
    cards: [
      { title: "РћСЃРЅРѕРІРЅС‹Рµ С†РІРµС‚Р°", body: "rot вЂ” РєСЂР°СЃРЅС‹Р№\nblau вЂ” СЃРёРЅРёР№\ngelb вЂ” Р¶С‘Р»С‚С‹Р№\ngrГјn вЂ” Р·РµР»С‘РЅС‹Р№\nschwarz вЂ” С‡С‘СЂРЅС‹Р№\nweiГџ вЂ” Р±РµР»С‹Р№\ngrau вЂ” СЃРµСЂС‹Р№\nbraun вЂ” РєРѕСЂРёС‡РЅРµРІС‹Р№\norange вЂ” РѕСЂР°РЅР¶РµРІС‹Р№\nlila вЂ” С„РёРѕР»РµС‚РѕРІС‹Р№\nrosa вЂ” СЂРѕР·РѕРІС‹Р№" },
      { title: "РљР°Рє РёСЃРїРѕР»СЊР·РѕРІР°С‚СЊ С†РІРµС‚Р°", body: "Das Auto ist rot. вЂ” РњР°С€РёРЅР° РєСЂР°СЃРЅР°СЏ.\nIch mag Blau. вЂ” РњРЅРµ РЅСЂР°РІРёС‚СЃСЏ СЃРёРЅРёР№.\n\nрџ’Ў РџРѕСЃР»Рµ РіР»Р°РіРѕР»Р° В«seinВ» С†РІРµС‚ РЅРµ СЃРєР»РѕРЅСЏРµС‚СЃСЏ:\nDas Haus ist grГјn. вњ“\n\nРџРµСЂРµРґ СЃСѓС‰РµСЃС‚РІРёС‚РµР»СЊРЅС‹Рј вЂ” СЃРєР»РѕРЅСЏРµС‚СЃСЏ:\nein rotes Haus (РєСЂР°СЃРЅС‹Р№ РґРѕРј)\neine blaue TГјr (СЃРёРЅСЏСЏ РґРІРµСЂСЊ)" },
    ],
    exam: [
      { q: "РљР°Рє РїРѕ-РЅРµРјРµС†РєРё В«РєСЂР°СЃРЅС‹Р№В»?", options: ["blau", "grГјn", "rot", "gelb"], answer: 2 },
      { q: "В«SchwarzВ» РѕР·РЅР°С‡Р°РµС‚:", options: ["Р±РµР»С‹Р№", "СЃРµСЂС‹Р№", "С‡С‘СЂРЅС‹Р№", "РєРѕСЂРёС‡РЅРµРІС‹Р№"], answer: 2 },
      { q: "РљР°Рє СЃРєР°Р·Р°С‚СЊ В«РњР°С€РёРЅР° СЃРёРЅСЏСЏВ»?", options: ["Das Auto ist blau.", "Das Auto ist blue.", "Das Auto bin blau.", "Das Auto hat blau."], answer: 0 },
      { q: "В«WeiГџВ» вЂ” СЌС‚Рѕ:", options: ["СЃРµСЂС‹Р№", "Р±РµР»С‹Р№", "Р¶С‘Р»С‚С‹Р№", "СЂРѕР·РѕРІС‹Р№"], answer: 1 },
      { q: "В«GrГјnВ» РѕР·РЅР°С‡Р°РµС‚:", options: ["СЃРёРЅРёР№", "РєРѕСЂРёС‡РЅРµРІС‹Р№", "Р·РµР»С‘РЅС‹Р№", "С„РёРѕР»РµС‚РѕРІС‹Р№"], answer: 2 },
    ],
  },
  {
    id: "verbs_sein_haben",
    title: "Р“Р»Р°РіРѕР»С‹: sein Рё haben",
    emoji: "вљЎ",
    level: "A1",
    cards: [
      { title: "Р“Р»Р°РіРѕР» sein (Р±С‹С‚СЊ)", body: "ich bin вЂ” СЏ РµСЃС‚СЊ\ndu bist вЂ” С‚С‹ РµСЃС‚СЊ\ner/sie/es ist вЂ” РѕРЅ/РѕРЅР°/РѕРЅРѕ РµСЃС‚СЊ\nwir sind вЂ” РјС‹ РµСЃС‚СЊ\nihr seid вЂ” РІС‹ РµСЃС‚СЊ\nsie/Sie sind вЂ” РѕРЅРё/Р’С‹ РµСЃС‚СЊ\n\nРџСЂРёРјРµСЂС‹:\nIch bin mГјde. вЂ” РЇ СѓСЃС‚Р°Р».\nDu bist nett. вЂ” РўС‹ РїСЂРёСЏС‚РЅС‹Р№.\nSie ist Lehrerin. вЂ” РћРЅР° СѓС‡РёС‚РµР»СЊРЅРёС†Р°." },
      { title: "Р“Р»Р°РіРѕР» haben (РёРјРµС‚СЊ)", body: "ich habe вЂ” Сѓ РјРµРЅСЏ РµСЃС‚СЊ\ndu hast вЂ” Сѓ С‚РµР±СЏ РµСЃС‚СЊ\ner/sie/es hat вЂ” Сѓ РЅРµРіРѕ/РЅРµС‘ РµСЃС‚СЊ\nwir haben вЂ” Сѓ РЅР°СЃ РµСЃС‚СЊ\nihr habt вЂ” Сѓ РІР°СЃ РµСЃС‚СЊ\nsie/Sie haben вЂ” Сѓ РЅРёС…/Р’Р°СЃ РµСЃС‚СЊ\n\nРџСЂРёРјРµСЂС‹:\nIch habe ein Auto. вЂ” РЈ РјРµРЅСЏ РµСЃС‚СЊ РјР°С€РёРЅР°.\nEr hat Hunger. вЂ” РћРЅ РіРѕР»РѕРґРµРЅ. (Р±СѓРєРІ: Сѓ РЅРµРіРѕ РµСЃС‚СЊ РіРѕР»РѕРґ)" },
      { title: "Sein vs Haben", body: "sein вЂ” РѕРїРёСЃС‹РІР°РµС‚ СЃРѕСЃС‚РѕСЏРЅРёРµ РёР»Рё Р»РёС‡РЅРѕСЃС‚СЊ:\nIch bin glГјcklich. вЂ” РЇ СЃС‡Р°СЃС‚Р»РёРІ.\nSie ist Г„rztin. вЂ” РћРЅР° РІСЂР°С‡.\n\nhaben вЂ” РѕР±РѕР·РЅР°С‡Р°РµС‚ РІР»Р°РґРµРЅРёРµ:\nIch habe Zeit. вЂ” РЈ РјРµРЅСЏ РµСЃС‚СЊ РІСЂРµРјСЏ.\nWir haben Hunger. вЂ” РњС‹ РіРѕР»РѕРґРЅС‹.\n\nрџ’Ў Hunger/Durst haben = Р±С‹С‚СЊ РіРѕР»РѕРґРЅС‹Рј/Р¶Р°Р¶РґСѓС‰РёРј" },
    ],
    exam: [
      { q: "В«Du ___ mГјde.В» вЂ” РІСЃС‚Р°РІСЊ РїСЂР°РІРёР»СЊРЅСѓСЋ С„РѕСЂРјСѓ sein:", options: ["bin", "bist", "ist", "sind"], answer: 1 },
      { q: "В«Wir ___ ein Haus.В» вЂ” РІСЃС‚Р°РІСЊ haben:", options: ["habe", "hast", "hat", "haben"], answer: 3 },
      { q: "В«Er ___ Arzt.В» вЂ” РІСЃС‚Р°РІСЊ sein:", options: ["bin", "bist", "ist", "sind"], answer: 2 },
      { q: "РљР°Рє СЃРєР°Р·Р°С‚СЊ В«РЈ РЅРµС‘ РµСЃС‚СЊ РєРѕС‚В»?", options: ["Sie ist einen Kater.", "Sie hat einen Kater.", "Sie haben einen Kater.", "Sie hast einen Kater."], answer: 1 },
      { q: "В«Ich habe HungerВ» Р±СѓРєРІР°Р»СЊРЅРѕ Р·РЅР°С‡РёС‚:", options: ["РЇ С…РѕС‡Сѓ РµСЃС‚СЊ", "РЈ РјРµРЅСЏ РµСЃС‚СЊ РіРѕР»РѕРґ", "РњРЅРµ РЅСѓР¶РЅР° РµРґР°", "РЇ РіРѕР»РѕРґРЅС‹Р№ С‡РµР»РѕРІРµРє"], answer: 1 },
    ],
  },
  {
    id: "word_order",
    title: "РџРѕСЂСЏРґРѕРє СЃР»РѕРІ",
    emoji: "рџ“ђ",
    level: "A1",
    cards: [
      { title: "РћСЃРЅРѕРІРЅРѕР№ РїРѕСЂСЏРґРѕРє СЃР»РѕРІ", body: "Р’ РЅРµРјРµС†РєРѕРј РїСЂРµРґР»РѕР¶РµРЅРёРё РіР»Р°РіРѕР» Р’РЎР•Р“Р”Рђ СЃС‚РѕРёС‚ РЅР° 2-Рј РјРµСЃС‚Рµ:\n\nIch [1] trinke [2] Kaffee.\nHeute [1] trinke [2] ich Kaffee.\nKaffee [1] trinke [2] ich heute.\n\nрџ’Ў Р§С‚Рѕ Р±С‹ РЅРё СЃС‚РѕСЏР»Рѕ РЅР° РїРµСЂРІРѕРј РјРµСЃС‚Рµ вЂ” РіР»Р°РіРѕР» РІСЃРµРіРґР° РІС‚РѕСЂРѕР№!" },
      { title: "Р’РѕРїСЂРѕСЃРёС‚РµР»СЊРЅС‹Рµ РїСЂРµРґР»РѕР¶РµРЅРёСЏ", body: "Р’РѕРїСЂРѕСЃ СЃ РІРѕРїСЂРѕСЃРёС‚РµР»СЊРЅС‹Рј СЃР»РѕРІРѕРј:\nWo wohnst du? вЂ” Р“РґРµ С‚С‹ Р¶РёРІС‘С€СЊ?\nWas machst du? вЂ” Р§С‚Рѕ С‚С‹ РґРµР»Р°РµС€СЊ?\nWer bist du? вЂ” РљС‚Рѕ С‚С‹?\n\nР’РѕРїСЂРѕСЃ Р±РµР· РІРѕРїСЂ. СЃР»РѕРІР° (РіР»Р°РіРѕР» РЅР° 1-Рј):\nKommst du? вЂ” РўС‹ РїСЂРёРґС‘С€СЊ?\nHast du Zeit? вЂ” РЈ С‚РµР±СЏ РµСЃС‚СЊ РІСЂРµРјСЏ?" },
      { title: "РћС‚СЂРёС†Р°РЅРёРµ", body: "nicht вЂ” РѕС‚СЂРёС†Р°РµС‚ РіР»Р°РіРѕР» РёР»Рё РїСЂРёР»Р°РіР°С‚РµР»СЊРЅРѕРµ:\nIch schlafe nicht. вЂ” РЇ РЅРµ СЃРїР»СЋ.\nDas ist nicht gut. вЂ” Р­С‚Рѕ РЅРµС…РѕСЂРѕС€Рѕ.\n\nkein/keine вЂ” РѕС‚СЂРёС†Р°РµС‚ СЃСѓС‰РµСЃС‚РІРёС‚РµР»СЊРЅРѕРµ:\nIch habe kein Auto. вЂ” РЈ РјРµРЅСЏ РЅРµС‚ РјР°С€РёРЅС‹.\nIch habe keine Zeit. вЂ” РЈ РјРµРЅСЏ РЅРµС‚ РІСЂРµРјРµРЅРё.\n\nрџ’Ў kein = ein + РЅРµ; keine = eine + РЅРµ" },
    ],
    exam: [
      { q: "Р“РґРµ РІ РЅРµРјРµС†РєРѕРј РїСЂРµРґР»РѕР¶РµРЅРёРё СЃС‚РѕРёС‚ РіР»Р°РіРѕР»?", options: ["Р’СЃРµРіРґР° РїРµСЂРІС‹Р№", "Р’СЃРµРіРґР° РІС‚РѕСЂРѕР№", "Р’СЃРµРіРґР° РїРѕСЃР»РµРґРЅРёР№", "Р“РґРµ СѓРіРѕРґРЅРѕ"], answer: 1 },
      { q: "Р’С‹Р±РµСЂРё РїСЂР°РІРёР»СЊРЅС‹Р№ РїРѕСЂСЏРґРѕРє СЃР»РѕРІ:", options: ["Ich heute trinke Tee.", "Heute ich trinke Tee.", "Heute trinke ich Tee.", "Trinke heute ich Tee."], answer: 2 },
      { q: "РљР°Рє Р·Р°РґР°С‚СЊ РІРѕРїСЂРѕСЃ В«РЈ С‚РµР±СЏ РµСЃС‚СЊ РІСЂРµРјСЏ?В»", options: ["Du hast Zeit?", "Hast du Zeit?", "Zeit du hast?", "Hast Zeit du?"], answer: 1 },
      { q: "В«Ich habe ___ AutoВ» (Сѓ РјРµРЅСЏ РЅРµС‚ РјР°С€РёРЅС‹):", options: ["nicht", "keine", "kein", "nein"], answer: 2 },
      { q: "В«Ich schlafe ___В» (СЏ РЅРµ СЃРїР»СЋ):", options: ["kein", "keine", "nicht", "nein"], answer: 2 },
    ],
  },
  {
    id: "food",
    title: "Р•РґР° Рё РЅР°РїРёС‚РєРё",
    emoji: "рџЌЅпёЏ",
    level: "A1",
    cards: [
      { title: "РћСЃРЅРѕРІРЅС‹Рµ РїСЂРѕРґСѓРєС‚С‹", body: "das Brot вЂ” С…Р»РµР±\ndie Milch вЂ” РјРѕР»РѕРєРѕ\ndas Wasser вЂ” РІРѕРґР°\nder Kaffee вЂ” РєРѕС„Рµ\nder Tee вЂ” С‡Р°Р№\ndas Fleisch вЂ” РјСЏСЃРѕ\nder KГ¤se вЂ” СЃС‹СЂ\ndas Ei вЂ” СЏР№С†Рѕ\ndas GemГјse вЂ” РѕРІРѕС‰Рё\ndas Obst вЂ” С„СЂСѓРєС‚С‹" },
      { title: "Р’ РєР°С„Рµ Рё СЂРµСЃС‚РѕСЂР°РЅРµ", body: "Ich mГ¶chte... вЂ” РЇ Р±С‹ С…РѕС‚РµР»...\nEin Kaffee, bitte! вЂ” РљРѕС„Рµ, РїРѕР¶Р°Р»СѓР№СЃС‚Р°!\nDie Speisekarte, bitte. вЂ” РњРµРЅСЋ, РїРѕР¶Р°Р»СѓР№СЃС‚Р°.\nWas kostet das? вЂ” РЎРєРѕР»СЊРєРѕ СЌС‚Рѕ СЃС‚РѕРёС‚?\nDie Rechnung, bitte! вЂ” РЎС‡С‘С‚, РїРѕР¶Р°Р»СѓР№СЃС‚Р°!\nEs war sehr lecker! вЂ” Р‘С‹Р»Рѕ РѕС‡РµРЅСЊ РІРєСѓСЃРЅРѕ!" },
    ],
    exam: [
      { q: "РљР°Рє РїРѕРїСЂРѕСЃРёС‚СЊ СЃС‡С‘С‚ РІ СЂРµСЃС‚РѕСЂР°РЅРµ?", options: ["Das MenГј, bitte!", "Die Rechnung, bitte!", "Ich mГ¶chte essen.", "Was kostet das?"], answer: 1 },
      { q: "В«Das GemГјseВ» вЂ” СЌС‚Рѕ:", options: ["С„СЂСѓРєС‚С‹", "РјСЏСЃРѕ", "РѕРІРѕС‰Рё", "С…Р»РµР±"], answer: 2 },
      { q: "РљР°Рє СЃРєР°Р·Р°С‚СЊ В«РЇ Р±С‹ С…РѕС‚РµР» РєРѕС„РµВ»?", options: ["Ich habe Kaffee.", "Ich bin Kaffee.", "Ich mГ¶chte Kaffee.", "Ich trinke Kaffee bitte."], answer: 2 },
      { q: "В«LeckerВ» РѕР·РЅР°С‡Р°РµС‚:", options: ["РґРѕСЂРѕРіРѕР№", "РІРєСѓСЃРЅС‹Р№", "РіРѕСЂСЏС‡РёР№", "С…РѕР»РѕРґРЅС‹Р№"], answer: 1 },
      { q: "В«Das EiВ» вЂ” СЌС‚Рѕ:", options: ["СЃС‹СЂ", "РјРѕР»РѕРєРѕ", "СЏР№С†Рѕ", "С…Р»РµР±"], answer: 2 },
    ],
  },

  // в”Ђв”Ђ A1 РїСЂРѕРґРѕР»Р¶РµРЅРёРµ в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ
  {
    id: "professions",
    title: "РџСЂРѕС„РµСЃСЃРёРё",
    emoji: "рџ’ј",
    level: "A1",
    cards: [
      { title: "РџСЂРѕС„РµСЃСЃРёРё", body: "der Arzt / die Г„rztin вЂ” РІСЂР°С‡\nder Lehrer / die Lehrerin вЂ” СѓС‡РёС‚РµР»СЊ\nder Ingenieur вЂ” РёРЅР¶РµРЅРµСЂ\nder Koch / die KГ¶chin вЂ” РїРѕРІР°СЂ\nder Polizist вЂ” РїРѕР»РёС†РµР№СЃРєРёР№\ndie Krankenschwester вЂ” РјРµРґСЃРµСЃС‚СЂР°\nder VerkГ¤ufer вЂ” РїСЂРѕРґР°РІРµС†\nder Student вЂ” СЃС‚СѓРґРµРЅС‚" },
      { title: "РљР°Рє РіРѕРІРѕСЂРёС‚СЊ Рѕ РїСЂРѕС„РµСЃСЃРёРё", body: "Ich bin Lehrerin. вЂ” РЇ СѓС‡РёС‚РµР»СЊРЅРёС†Р°.\nEr ist Arzt. вЂ” РћРЅ РІСЂР°С‡.\nSie arbeitet als KГ¶chin. вЂ” РћРЅР° СЂР°Р±РѕС‚Р°РµС‚ РїРѕРІР°СЂРѕРј.\n\nрџ’Ў РџРµСЂРµРґ РїСЂРѕС„РµСЃСЃРёРµР№ РќР•Рў Р°СЂС‚РёРєР»СЏ:\nIch bin Arzt. вњ“ (РЅРµ В«ein ArztВ»)\n\nWas bist du von Beruf? вЂ” РљРµРј С‚С‹ СЂР°Р±РѕС‚Р°РµС€СЊ?" },
    ],
    exam: [
      { q: "РљР°Рє СЃРєР°Р·Р°С‚СЊ В«РЇ РІСЂР°С‡В»?", options: ["Ich habe ein Arzt.", "Ich bin ein Arzt.", "Ich bin Arzt.", "Ich arbeite Arzt."], answer: 2 },
      { q: "В«Die Г„rztinВ» вЂ” СЌС‚Рѕ:", options: ["РјРµРґСЃРµСЃС‚СЂР°", "РІСЂР°С‡-Р¶РµРЅС‰РёРЅР°", "СѓС‡РёС‚РµР»СЊРЅРёС†Р°", "СЃС‚СѓРґРµРЅС‚РєР°"], answer: 1 },
      { q: "РљР°Рє СЃРїСЂРѕСЃРёС‚СЊ Рѕ РїСЂРѕС„РµСЃСЃРёРё?", options: ["Was machst du?", "Was bist du von Beruf?", "Wo arbeitest du?", "Wie heiГџt du?"], answer: 1 },
      { q: "В«Der KochВ» вЂ” СЌС‚Рѕ:", options: ["РІСЂР°С‡", "СѓС‡РёС‚РµР»СЊ", "РїРѕРІР°СЂ", "РїСЂРѕРґР°РІРµС†"], answer: 2 },
      { q: "В«Sie arbeitet als LehrerinВ» Р·РЅР°С‡РёС‚:", options: ["РћРЅР° СѓС‡РёС‚СЃСЏ", "РћРЅР° СЂР°Р±РѕС‚Р°РµС‚ СѓС‡РёС‚РµР»СЊРЅРёС†РµР№", "РћРЅР° Р±С‹Р»Р° СѓС‡РёС‚РµР»СЊРЅРёС†РµР№", "РћРЅР° РёС‰РµС‚ СЂР°Р±РѕС‚Сѓ"], answer: 1 },
    ],
  },
  {
    id: "weekdays",
    title: "Р”РЅРё РЅРµРґРµР»Рё",
    emoji: "рџ“…",
    level: "A1",
    cards: [
      { title: "Р”РЅРё РЅРµРґРµР»Рё", body: "der Montag вЂ” РїРѕРЅРµРґРµР»СЊРЅРёРє\nder Dienstag вЂ” РІС‚РѕСЂРЅРёРє\nder Mittwoch вЂ” СЃСЂРµРґР°\nder Donnerstag вЂ” С‡РµС‚РІРµСЂРі\nder Freitag вЂ” РїСЏС‚РЅРёС†Р°\nder Samstag вЂ” СЃСѓР±Р±РѕС‚Р°\nder Sonntag вЂ” РІРѕСЃРєСЂРµСЃРµРЅСЊРµ" },
      { title: "РљР°Рє РёСЃРїРѕР»СЊР·РѕРІР°С‚СЊ РґРЅРё", body: "Am Montag вЂ” РІ РїРѕРЅРµРґРµР»СЊРЅРёРє\nAm Wochenende вЂ” РЅР° РІС‹С…РѕРґРЅС‹С…\nMontagmorgen вЂ” СѓС‚СЂРѕ РїРѕРЅРµРґРµР»СЊРЅРёРєР°\n\nрџ’Ў Р’СЃРµ РґРЅРё РјСѓР¶СЃРєРѕРіРѕ СЂРѕРґР°: der\nРЎРѕРєСЂР°С‰РµРЅРёСЏ: Mo Di Mi Do Fr Sa So\n\nHeute ist Mittwoch. вЂ” РЎРµРіРѕРґРЅСЏ СЃСЂРµРґР°." },
    ],
    exam: [
      { q: "РљР°Рє РїРѕ-РЅРµРјРµС†РєРё В«РїСЏС‚РЅРёС†Р°В»?", options: ["Donnerstag", "Freitag", "Samstag", "Montag"], answer: 1 },
      { q: "В«Am MontagВ» Р·РЅР°С‡РёС‚:", options: ["РІ РїРѕРЅРµРґРµР»СЊРЅРёРє", "СЃ РїРѕРЅРµРґРµР»СЊРЅРёРєР°", "РґРѕ РїРѕРЅРµРґРµР»СЊРЅРёРєР°", "РІ РїСЂРѕС€Р»С‹Р№ РїРѕРЅРµРґРµР»СЊРЅРёРє"], answer: 0 },
      { q: "РљР°РєРѕР№ РґРµРЅСЊ РёРґС‘С‚ РїРѕСЃР»Рµ Mittwoch?", options: ["Dienstag", "Donnerstag", "Freitag", "Montag"], answer: 1 },
      { q: "В«Das WochenendeВ» вЂ” СЌС‚Рѕ:", options: ["Р±СѓРґРЅРё", "РІС‹С…РѕРґРЅС‹Рµ", "РїСЂР°Р·РґРЅРёРє", "РѕС‚РїСѓСЃРє"], answer: 1 },
      { q: "РљР°РєРѕРіРѕ СЂРѕРґР° РІСЃРµ РґРЅРё РЅРµРґРµР»Рё?", options: ["die", "das", "der", "СЂР°Р·РЅРѕРіРѕ СЂРѕРґР°"], answer: 2 },
    ],
  },
  {
    id: "months",
    title: "РњРµСЃСЏС†С‹ Рё СЃРµР·РѕРЅС‹",
    emoji: "рџ—“пёЏ",
    level: "A1",
    cards: [
      { title: "РњРµСЃСЏС†С‹", body: "Januar вЂ” СЏРЅРІР°СЂСЊ\nFebruar вЂ” С„РµРІСЂР°Р»СЊ\nMГ¤rz вЂ” РјР°СЂС‚\nApril вЂ” Р°РїСЂРµР»СЊ\nMai вЂ” РјР°Р№\nJuni вЂ” РёСЋРЅСЊ\nJuli вЂ” РёСЋР»СЊ\nAugust вЂ” Р°РІРіСѓСЃС‚\nSeptember вЂ” СЃРµРЅС‚СЏР±СЂСЊ\nOktober вЂ” РѕРєС‚СЏР±СЂСЊ\nNovember вЂ” РЅРѕСЏР±СЂСЊ\nDezember вЂ” РґРµРєР°Р±СЂСЊ" },
      { title: "Р’СЂРµРјРµРЅР° РіРѕРґР°", body: "der FrГјhling вЂ” РІРµСЃРЅР°\nder Sommer вЂ” Р»РµС‚Рѕ\nder Herbst вЂ” РѕСЃРµРЅСЊ\nder Winter вЂ” Р·РёРјР°\n\nim Sommer вЂ” Р»РµС‚РѕРј\nim Winter вЂ” Р·РёРјРѕР№\n\nрџ’Ў Im Januar = РІ СЏРЅРІР°СЂРµ\n(im = in dem, РїСЂРµРґР»РѕРі + Р°СЂС‚РёРєР»СЊ)" },
    ],
    exam: [
      { q: "РљР°Рє РїРѕ-РЅРµРјРµС†РєРё В«РјР°СЂС‚В»?", options: ["Mai", "MГ¤rz", "April", "Februar"], answer: 1 },
      { q: "В«Im SommerВ» Р·РЅР°С‡РёС‚:", options: ["РІРµСЃРЅРѕР№", "РѕСЃРµРЅСЊСЋ", "Р»РµС‚РѕРј", "Р·РёРјРѕР№"], answer: 2 },
      { q: "В«Der HerbstВ» вЂ” СЌС‚Рѕ:", options: ["РІРµСЃРЅР°", "Р»РµС‚Рѕ", "РѕСЃРµРЅСЊ", "Р·РёРјР°"], answer: 2 },
      { q: "РљР°Рє СЃРєР°Р·Р°С‚СЊ В«РІ РґРµРєР°Р±СЂРµВ»?", options: ["am Dezember", "im Dezember", "in Dezember", "der Dezember"], answer: 1 },
      { q: "РљР°РєРѕР№ РјРµСЃСЏС† РёРґС‘С‚ РїРѕСЃР»Рµ Juli?", options: ["Juni", "September", "August", "Oktober"], answer: 2 },
    ],
  },
  {
    id: "time",
    title: "РљРѕС‚РѕСЂС‹Р№ С‡Р°СЃ",
    emoji: "рџ•ђ",
    level: "A1",
    cards: [
      { title: "РљР°Рє СЃРїСЂРѕСЃРёС‚СЊ РІСЂРµРјСЏ", body: "Wie viel Uhr ist es? вЂ” РљРѕС‚РѕСЂС‹Р№ С‡Р°СЃ?\nWie spГ¤t ist es? вЂ” РЎРєРѕР»СЊРєРѕ РІСЂРµРјРµРЅРё?\n\nEs ist... вЂ” РЎРµР№С‡Р°СЃ...\nein Uhr вЂ” С‡Р°СЃ\nzwei Uhr вЂ” РґРІР° С‡Р°СЃР°\ndrei Uhr вЂ” С‚СЂРё С‡Р°СЃР°\nzwГ¶lf Uhr вЂ” РґРІРµРЅР°РґС†Р°С‚СЊ С‡Р°СЃРѕРІ" },
      { title: "РњРёРЅСѓС‚С‹ Рё С‡Р°СЃС‚Рё РґРЅСЏ", body: "Es ist halb drei. вЂ” РџРѕР»РѕРІРёРЅР° С‚СЂРµС‚СЊРµРіРѕ (2:30)\nEs ist Viertel nach vier. вЂ” Р§РµС‚РІРµСЂС‚СЊ РїСЏС‚РѕРіРѕ (4:15)\nEs ist Viertel vor fГјnf. вЂ” Р‘РµР· С‡РµС‚РІРµСЂС‚Рё РїСЏС‚СЊ (4:45)\n\nрџ’Ў halb drei = РїРѕР»РѕРІРёРЅР° Р”Рћ С‚СЂС‘С… = 2:30\nРћС‚Р»РёС‡Р°РµС‚СЃСЏ РѕС‚ СЂСѓСЃСЃРєРѕРіРѕ!" },
    ],
    exam: [
      { q: "РљР°Рє СЃРїСЂРѕСЃРёС‚СЊ В«РєРѕС‚РѕСЂС‹Р№ С‡Р°СЃВ»?", options: ["Was ist die Zeit?", "Wie viel Uhr ist es?", "Wann ist es?", "Um wie Uhr?"], answer: 1 },
      { q: "В«Es ist halb dreiВ» вЂ” СЌС‚Рѕ:", options: ["3:00", "3:30", "2:30", "2:15"], answer: 2 },
      { q: "В«Viertel nach vierВ» вЂ” СЌС‚Рѕ:", options: ["3:45", "4:15", "4:45", "5:15"], answer: 1 },
      { q: "В«Es ist zwei UhrВ» Р·РЅР°С‡РёС‚:", options: ["РґРІР° С‡Р°СЃР°", "РІС‚РѕСЂРѕР№ С‡Р°СЃ", "РІ РґРІР° С‡Р°СЃР°", "РѕРєРѕР»Рѕ РґРІСѓС…"], answer: 0 },
      { q: "В«Viertel vor fГјnfВ» вЂ” СЌС‚Рѕ:", options: ["5:15", "4:45", "5:45", "4:15"], answer: 1 },
    ],
  },
  {
    id: "clothes",
    title: "РћРґРµР¶РґР°",
    emoji: "рџ‘•",
    level: "A1",
    cards: [
      { title: "РџСЂРµРґРјРµС‚С‹ РѕРґРµР¶РґС‹", body: "das T-Shirt вЂ” С„СѓС‚Р±РѕР»РєР°\ndie Hose вЂ” Р±СЂСЋРєРё\ndas Kleid вЂ” РїР»Р°С‚СЊРµ\nder Rock вЂ” СЋР±РєР°\ndie Jacke вЂ” РєСѓСЂС‚РєР°\nder Mantel вЂ” РїР°Р»СЊС‚Рѕ\ndie Schuhe вЂ” С‚СѓС„Р»Рё / РѕР±СѓРІСЊ\ndie Socken вЂ” РЅРѕСЃРєРё\nder Hut вЂ” С€Р»СЏРїР°\ndie MГјtze вЂ” С€Р°РїРєР°" },
      { title: "РџРѕРєСѓРїРєР° РѕРґРµР¶РґС‹", body: "Ich suche... вЂ” РЇ РёС‰Сѓ...\nWelche GrГ¶Гџe? вЂ” РљР°РєРѕР№ СЂР°Р·РјРµСЂ?\nKann ich das anprobieren? вЂ” РњРѕР¶РЅРѕ РїСЂРёРјРµСЂРёС‚СЊ?\nDas passt gut! вЂ” РҐРѕСЂРѕС€Рѕ РїРѕРґС…РѕРґРёС‚!\nDas ist zu groГџ/klein. вЂ” Р­С‚Рѕ СЃР»РёС€РєРѕРј Р±РѕР»СЊС€РѕРµ/РјР°Р»РµРЅСЊРєРѕРµ.\nIch nehme es. вЂ” РЇ СЌС‚Рѕ РІРѕР·СЊРјСѓ." },
    ],
    exam: [
      { q: "В«Die JackeВ» вЂ” СЌС‚Рѕ:", options: ["РїР»Р°С‚СЊРµ", "СЋР±РєР°", "РєСѓСЂС‚РєР°", "РїР°Р»СЊС‚Рѕ"], answer: 2 },
      { q: "РљР°Рє СЃРєР°Р·Р°С‚СЊ В«РњРѕР¶РЅРѕ РїСЂРёРјРµСЂРёС‚СЊВ»?", options: ["Ich nehme es.", "Kann ich das anprobieren?", "Welche GrГ¶Гџe?", "Das passt gut!"], answer: 1 },
      { q: "В«Der RockВ» вЂ” СЌС‚Рѕ:", options: ["Р±СЂСЋРєРё", "СЂСѓР±Р°С€РєР°", "СЋР±РєР°", "С€Р»СЏРїР°"], answer: 2 },
      { q: "В«Das passt gutВ» Р·РЅР°С‡РёС‚:", options: ["Р­С‚Рѕ РґРѕСЂРѕРіРѕ", "РҐРѕСЂРѕС€Рѕ РїРѕРґС…РѕРґРёС‚", "РЎР»РёС€РєРѕРј РјР°Р»РµРЅСЊРєРѕРµ", "РњРЅРµ РЅРµ РЅСЂР°РІРёС‚СЃСЏ"], answer: 1 },
      { q: "В«Die SchuheВ» вЂ” СЌС‚Рѕ:", options: ["РЅРѕСЃРєРё", "С€Р°РїРєР°", "РѕР±СѓРІСЊ", "РїРµСЂС‡Р°С‚РєРё"], answer: 2 },
    ],
  },
  {
    id: "health",
    title: "РўРµР»Рѕ Рё Р·РґРѕСЂРѕРІСЊРµ",
    emoji: "рџЏҐ",
    level: "A1",
    cards: [
      { title: "Р§Р°СЃС‚Рё С‚РµР»Р°", body: "der Kopf вЂ” РіРѕР»РѕРІР°\ndas Auge вЂ” РіР»Р°Р·\ndie Nase вЂ” РЅРѕСЃ\nder Mund вЂ” СЂРѕС‚\ndas Ohr вЂ” СѓС…Рѕ\nder Arm вЂ” СЂСѓРєР° (СЂСѓРєР° РґРѕ РїР»РµС‡Р°)\ndie Hand вЂ” СЂСѓРєР° (РєРёСЃС‚СЊ)\ndas Bein вЂ” РЅРѕРіР°\nder FuГџ вЂ” СЃС‚РѕРїР°\nder Bauch вЂ” Р¶РёРІРѕС‚\nder RГјcken вЂ” СЃРїРёРЅР°" },
      { title: "РЈ РІСЂР°С‡Р°", body: "Ich bin krank. вЂ” РЇ Р±РѕР»РµРЅ.\nMir ist schlecht. вЂ” РњРЅРµ РїР»РѕС…Рѕ.\nIch habe Kopfschmerzen. вЂ” РЈ РјРµРЅСЏ Р±РѕР»РёС‚ РіРѕР»РѕРІР°.\nIch habe Fieber. вЂ” РЈ РјРµРЅСЏ С‚РµРјРїРµСЂР°С‚СѓСЂР°.\nRufen Sie einen Arzt! вЂ” Р’С‹Р·РѕРІРёС‚Рµ РІСЂР°С‡Р°!\n\nрџ’Ў _schmerzen = Р±РѕР»СЊ РІ...\nBauchschmerzen вЂ” Р±РѕР»СЊ РІ Р¶РёРІРѕС‚Рµ\nHalsschmerzen вЂ” Р±РѕР»СЊ РІ РіРѕСЂР»Рµ" },
    ],
    exam: [
      { q: "В«Der KopfВ» вЂ” СЌС‚Рѕ:", options: ["СЂСѓРєР°", "РЅРѕРіР°", "РіРѕР»РѕРІР°", "СЃРїРёРЅР°"], answer: 2 },
      { q: "В«Ich habe FieberВ» Р·РЅР°С‡РёС‚:", options: ["Сѓ РјРµРЅСЏ РЅР°СЃРјРѕСЂРє", "Сѓ РјРµРЅСЏ С‚РµРјРїРµСЂР°С‚СѓСЂР°", "СЏ СѓСЃС‚Р°Р»", "СЏ РіРѕР»РѕРґРµРЅ"], answer: 1 },
      { q: "В«Mir ist schlechtВ» Р·РЅР°С‡РёС‚:", options: ["РјРЅРµ СЃРєСѓС‡РЅРѕ", "РјРЅРµ РїР»РѕС…Рѕ", "РјРЅРµ С…РѕР»РѕРґРЅРѕ", "РјРЅРµ Р¶Р°СЂРєРѕ"], answer: 1 },
      { q: "В«HalsschmerzenВ» вЂ” СЌС‚Рѕ Р±РѕР»СЊ РІ:", options: ["РіРѕР»РѕРІРµ", "Р¶РёРІРѕС‚Рµ", "РіРѕСЂР»Рµ", "СЃРїРёРЅРµ"], answer: 2 },
      { q: "В«Das BeinВ» вЂ” СЌС‚Рѕ:", options: ["СЂСѓРєР°", "РЅРѕРіР°", "Р¶РёРІРѕС‚", "РіР»Р°Р·"], answer: 1 },
    ],
  },
  {
    id: "shopping",
    title: "Р’ РјР°РіР°Р·РёРЅРµ",
    emoji: "рџ›’",
    level: "A1",
    cards: [
      { title: "РџРѕРєСѓРїРєРё", body: "Was kostet das? вЂ” РЎРєРѕР»СЊРєРѕ СЌС‚Рѕ СЃС‚РѕРёС‚?\nWie viel kostet...? вЂ” РЎРєРѕР»СЊРєРѕ СЃС‚РѕРёС‚...?\nDas ist zu teuer. вЂ” Р­С‚Рѕ СЃР»РёС€РєРѕРј РґРѕСЂРѕРіРѕ.\nIch nehme das. вЂ” РЇ СЌС‚Рѕ РІРѕР·СЊРјСѓ.\nHaben Sie...? вЂ” РЈ РІР°СЃ РµСЃС‚СЊ...?\nWo ist die Kasse? вЂ” Р“РґРµ РєР°СЃСЃР°?\nEin Pfund вЂ” РїРѕР»РєРёР»Рѕ (500Рі)" },
      { title: "Р”РµРЅСЊРіРё Рё С†РµРЅС‹", body: "der Euro вЂ” РµРІСЂРѕ\nder Cent вЂ” С†РµРЅС‚\nEs kostet 5 Euro. вЂ” Р­С‚Рѕ СЃС‚РѕРёС‚ 5 РµРІСЂРѕ.\nBezahlen Sie bar oder mit Karte?\nР’С‹ РїР»Р°С‚РёС‚Рµ РЅР°Р»РёС‡РЅС‹РјРё РёР»Рё РєР°СЂС‚РѕР№?\n\nbar вЂ” РЅР°Р»РёС‡РЅС‹РјРё\nmit Karte вЂ” РєР°СЂС‚РѕР№\nDas Wechselgeld вЂ” СЃРґР°С‡Р°" },
    ],
    exam: [
      { q: "РљР°Рє СЃРїСЂРѕСЃРёС‚СЊ В«РЎРєРѕР»СЊРєРѕ СЃС‚РѕРёС‚?В»", options: ["Was haben Sie?", "Was kostet das?", "Wo ist das?", "Was mГ¶chten Sie?"], answer: 1 },
      { q: "В«Wo ist die Kasse?В» Р·РЅР°С‡РёС‚:", options: ["Р“РґРµ РІС‹С…РѕРґ?", "Р“РґРµ РєР°СЃСЃР°?", "Р“РґРµ С‚РѕРІР°СЂ?", "Р“РґРµ РјР°РіР°Р·РёРЅ?"], answer: 1 },
      { q: "В«Bar bezahlenВ» Р·РЅР°С‡РёС‚:", options: ["РїР»Р°С‚РёС‚СЊ РєР°СЂС‚РѕР№", "РїР»Р°С‚РёС‚СЊ РЅР°Р»РёС‡РЅС‹РјРё", "РЅРµ РїР»Р°С‚РёС‚СЊ", "РїР»Р°С‚РёС‚СЊ РѕРЅР»Р°Р№РЅ"], answer: 1 },
      { q: "В«Das ist zu teuerВ» Р·РЅР°С‡РёС‚:", options: ["Р­С‚Рѕ РґС‘С€РµРІРѕ", "Р­С‚Рѕ Р±РµСЃРїР»Р°С‚РЅРѕ", "Р­С‚Рѕ СЃР»РёС€РєРѕРј РґРѕСЂРѕРіРѕ", "Р­С‚Рѕ С…РѕСЂРѕС€Р°СЏ С†РµРЅР°"], answer: 2 },
      { q: "В«Das WechselgeldВ» вЂ” СЌС‚Рѕ:", options: ["С†РµРЅР°", "СЃРєРёРґРєР°", "СЃРґР°С‡Р°", "С‡РµРє"], answer: 2 },
    ],
  },
  {
    id: "transport",
    title: "РўСЂР°РЅСЃРїРѕСЂС‚",
    emoji: "рџљЊ",
    level: "A1",
    cards: [
      { title: "Р’РёРґС‹ С‚СЂР°РЅСЃРїРѕСЂС‚Р°", body: "der Bus вЂ” Р°РІС‚РѕР±СѓСЃ\ndie U-Bahn вЂ” РјРµС‚СЂРѕ\ndie S-Bahn вЂ” СЌР»РµРєС‚СЂРёС‡РєР°\nder Zug вЂ” РїРѕРµР·Рґ\ndas Auto вЂ” РјР°С€РёРЅР°\ndas Fahrrad вЂ” РІРµР»РѕСЃРёРїРµРґ\ndas Taxi вЂ” С‚Р°РєСЃРё\ndas Flugzeug вЂ” СЃР°РјРѕР»С‘С‚\nzu FuГџ вЂ” РїРµС€РєРѕРј" },
      { title: "РќР° РІРѕРєР·Р°Р»Рµ Рё РѕСЃС‚Р°РЅРѕРІРєРµ", body: "Wo fГ¤hrt der Bus ab? вЂ” РћС‚РєСѓРґР° РѕС‚С…РѕРґРёС‚ Р°РІС‚РѕР±СѓСЃ?\nEinen Fahrschein, bitte. вЂ” РћРґРёРЅ Р±РёР»РµС‚, РїРѕР¶Р°Р»СѓР№СЃС‚Р°.\nWann kommt der Zug an? вЂ” РљРѕРіРґР° РїСЂРёР±С‹РІР°РµС‚ РїРѕРµР·Рґ?\nEin Ticket nach Berlin. вЂ” Р‘РёР»РµС‚ РґРѕ Р‘РµСЂР»РёРЅР°.\nGleis 3 вЂ” С‚СЂРµС‚РёР№ РїСѓС‚СЊ (РїР»Р°С‚С„РѕСЂРјР°)\numsteigen вЂ” РґРµР»Р°С‚СЊ РїРµСЂРµСЃР°РґРєСѓ" },
    ],
    exam: [
      { q: "В«Die U-BahnВ» вЂ” СЌС‚Рѕ:", options: ["Р°РІС‚РѕР±СѓСЃ", "С‚СЂР°РјРІР°Р№", "РјРµС‚СЂРѕ", "РїРѕРµР·Рґ"], answer: 2 },
      { q: "В«Zu FuГџ gehenВ» Р·РЅР°С‡РёС‚:", options: ["РµС…Р°С‚СЊ РЅР° РјР°С€РёРЅРµ", "РёРґС‚Рё РїРµС€РєРѕРј", "РµС…Р°С‚СЊ РЅР° РІРµР»РѕСЃРёРїРµРґРµ", "Р±РµР¶Р°С‚СЊ"], answer: 1 },
      { q: "В«UmsteigenВ» Р·РЅР°С‡РёС‚:", options: ["РєСѓРїРёС‚СЊ Р±РёР»РµС‚", "РѕРїРѕР·РґР°С‚СЊ", "РґРµР»Р°С‚СЊ РїРµСЂРµСЃР°РґРєСѓ", "РІС‹Р№С‚Рё РёР· РїРѕРµР·РґР°"], answer: 2 },
      { q: "В«Das FlugzeugВ» вЂ” СЌС‚Рѕ:", options: ["РїРѕРµР·Рґ", "РєРѕСЂР°Р±Р»СЊ", "СЃР°РјРѕР»С‘С‚", "Р°РІС‚РѕР±СѓСЃ"], answer: 2 },
      { q: "В«Wann kommt der Zug an?В» Р·РЅР°С‡РёС‚:", options: ["РћС‚РєСѓРґР° РµРґРµС‚ РїРѕРµР·Рґ?", "РљРѕРіРґР° РїСЂРёР±С‹РІР°РµС‚ РїРѕРµР·Рґ?", "Р“РґРµ РїРѕРµР·Рґ?", "РљР°Рє РґРѕР»РіРѕ РµРґРµС‚ РїРѕРµР·Рґ?"], answer: 1 },
    ],
  },
  {
    id: "hobbies",
    title: "РҐРѕР±Р±Рё Рё СЃРІРѕР±РѕРґРЅРѕРµ РІСЂРµРјСЏ",
    emoji: "рџЋ®",
    level: "A1",
    cards: [
      { title: "РҐРѕР±Р±Рё", body: "lesen вЂ” С‡РёС‚Р°С‚СЊ\nmusik hГ¶ren вЂ” СЃР»СѓС€Р°С‚СЊ РјСѓР·С‹РєСѓ\nfernsehen вЂ” СЃРјРѕС‚СЂРµС‚СЊ С‚РµР»РµРІРёР·РѕСЂ\nsport treiben вЂ” Р·Р°РЅРёРјР°С‚СЊСЃСЏ СЃРїРѕСЂС‚РѕРј\nkochen вЂ” РіРѕС‚РѕРІРёС‚СЊ\nreisen вЂ” РїСѓС‚РµС€РµСЃС‚РІРѕРІР°С‚СЊ\nzeichnen вЂ” СЂРёСЃРѕРІР°С‚СЊ\ntanzen вЂ” С‚Р°РЅС†РµРІР°С‚СЊ\nsingen вЂ” РїРµС‚СЊ\nspielen вЂ” РёРіСЂР°С‚СЊ" },
      { title: "РљР°Рє РіРѕРІРѕСЂРёС‚СЊ Рѕ С…РѕР±Р±Рё", body: "Ich lese gern. вЂ” РЇ Р»СЋР±Р»СЋ С‡РёС‚Р°С‚СЊ.\nIch spiele gern FuГџball. вЂ” РЇ Р»СЋР±Р»СЋ РёРіСЂР°С‚СЊ РІ С„СѓС‚Р±РѕР».\nIch mag Musik. вЂ” РњРЅРµ РЅСЂР°РІРёС‚СЃСЏ РјСѓР·С‹РєР°.\n\nрџ’Ў gern = РѕС…РѕС‚РЅРѕ, СЃ СѓРґРѕРІРѕР»СЊСЃС‚РІРёРµРј\nIch ... gern = РЇ Р»СЋР±Р»СЋ...\n\nWas machst du in der Freizeit?\nР§С‚Рѕ С‚С‹ РґРµР»Р°РµС€СЊ РІ СЃРІРѕР±РѕРґРЅРѕРµ РІСЂРµРјСЏ?" },
    ],
    exam: [
      { q: "В«Ich lese gernВ» Р·РЅР°С‡РёС‚:", options: ["РЇ СѓРјРµСЋ С‡РёС‚Р°С‚СЊ", "РЇ Р»СЋР±Р»СЋ С‡РёС‚Р°С‚СЊ", "РЇ С‡РёС‚Р°СЋ СЃРµР№С‡Р°СЃ", "РЇ Р±СѓРґСѓ С‡РёС‚Р°С‚СЊ"], answer: 1 },
      { q: "В«FernsehenВ» вЂ” СЌС‚Рѕ:", options: ["С‡РёС‚Р°С‚СЊ", "РіРѕС‚РѕРІРёС‚СЊ", "СЃРјРѕС‚СЂРµС‚СЊ С‚РµР»РµРІРёР·РѕСЂ", "РїСѓС‚РµС€РµСЃС‚РІРѕРІР°С‚СЊ"], answer: 2 },
      { q: "В«Sport treibenВ» Р·РЅР°С‡РёС‚:", options: ["СЃРјРѕС‚СЂРµС‚СЊ СЃРїРѕСЂС‚", "Р·Р°РЅРёРјР°С‚СЊСЃСЏ СЃРїРѕСЂС‚РѕРј", "РіРѕРІРѕСЂРёС‚СЊ Рѕ СЃРїРѕСЂС‚Рµ", "Р»СЋР±РёС‚СЊ СЃРїРѕСЂС‚"], answer: 1 },
      { q: "РљР°Рє СЃРєР°Р·Р°С‚СЊ В«РЇ Р»СЋР±Р»СЋ С‚Р°РЅС†РµРІР°С‚СЊВ»?", options: ["Ich tanze nicht.", "Ich kann tanzen.", "Ich tanze gern.", "Ich mГ¶chte tanzen."], answer: 2 },
      { q: "В«Die FreizeitВ» вЂ” СЌС‚Рѕ:", options: ["СЂР°Р±РѕС‚Р°", "СѓС‡С‘Р±Р°", "СЃРІРѕР±РѕРґРЅРѕРµ РІСЂРµРјСЏ", "РІС‹С…РѕРґРЅС‹Рµ"], answer: 2 },
    ],
  },
  {
    id: "modal_verbs",
    title: "РњРѕРґР°Р»СЊРЅС‹Рµ РіР»Р°РіРѕР»С‹",
    emoji: "рџ”‘",
    level: "A1",
    cards: [
      { title: "kГ¶nnen, mГјssen, wollen", body: "kГ¶nnen вЂ” РјРѕС‡СЊ, СѓРјРµС‚СЊ\nIch kann schwimmen. вЂ” РЇ СѓРјРµСЋ РїР»Р°РІР°С‚СЊ.\n\nmГјssen вЂ” РґРѕР»Р¶РµРЅ, РЅСѓР¶РЅРѕ\nIch muss arbeiten. вЂ” РњРЅРµ РЅСѓР¶РЅРѕ СЂР°Р±РѕС‚Р°С‚СЊ.\n\nwollen вЂ” С…РѕС‚РµС‚СЊ\nIch will nach Berlin. вЂ” РЇ С…РѕС‡Сѓ РІ Р‘РµСЂР»РёРЅ.\n\ndГјrfen вЂ” РёРјРµС‚СЊ РїСЂР°РІРѕ, СЂР°Р·СЂРµС€РµРЅРѕ\nDarf ich rauchen? вЂ” РњРѕР¶РЅРѕ РєСѓСЂРёС‚СЊ?" },
      { title: "Р¤РѕСЂРјС‹ РјРѕРґР°Р»СЊРЅС‹С… РіР»Р°РіРѕР»РѕРІ", body: "kГ¶nnen: ich kann, du kannst, er/sie kann\nmГјssen: ich muss, du musst, er/sie muss\nwollen: ich will, du willst, er/sie will\ndГјrfen: ich darf, du darfst, er/sie darf\n\nрџ’Ў РРЅС„РёРЅРёС‚РёРІ РёРґС‘С‚ Р’ РљРћРќР•Р¦ РїСЂРµРґР»РѕР¶РµРЅРёСЏ:\nIch kann heute nicht kommen.\nРњРЅРµ РЅРµ СѓРґР°СЃС‚СЃСЏ РїСЂРёР№С‚Рё СЃРµРіРѕРґРЅСЏ." },
    ],
    exam: [
      { q: "В«Ich kann Deutsch sprechenВ» Р·РЅР°С‡РёС‚:", options: ["РЇ С…РѕС‡Сѓ РіРѕРІРѕСЂРёС‚СЊ РїРѕ-РЅРµРјРµС†РєРё", "РЇ РјРѕРіСѓ РіРѕРІРѕСЂРёС‚СЊ РїРѕ-РЅРµРјРµС†РєРё", "РЇ РґРѕР»Р¶РµРЅ РіРѕРІРѕСЂРёС‚СЊ РїРѕ-РЅРµРјРµС†РєРё", "РЇ РЅРµ РіРѕРІРѕСЂСЋ РїРѕ-РЅРµРјРµС†РєРё"], answer: 1 },
      { q: "В«Du ___ das Buch lesenВ» (РґРѕР»Р¶РµРЅ) вЂ” РІСЃС‚Р°РІСЊ:", options: ["kannst", "willst", "musst", "darfst"], answer: 2 },
      { q: "Р“РґРµ СЃС‚РѕРёС‚ РёРЅС„РёРЅРёС‚РёРІ СЃ РјРѕРґР°Р»СЊРЅС‹Рј РіР»Р°РіРѕР»РѕРј?", options: ["Р’ РЅР°С‡Р°Р»Рµ", "РќР° РІС‚РѕСЂРѕРј РјРµСЃС‚Рµ", "Р’ РєРѕРЅС†Рµ", "РџРѕСЃР»Рµ РїРѕРґР»РµР¶Р°С‰РµРіРѕ"], answer: 2 },
      { q: "В«Darf ich...?В» РёСЃРїРѕР»СЊР·СѓСЋС‚ РєРѕРіРґР°:", options: ["С…РѕС‚СЏС‚ С‡С‚Рѕ-С‚Рѕ", "СЃРїСЂР°С€РёРІР°СЋС‚ СЂР°Р·СЂРµС€РµРЅРёРµ", "РѕРїРёСЃС‹РІР°СЋС‚ СѓРјРµРЅРёРµ", "РіРѕРІРѕСЂСЏС‚ РѕР± РѕР±СЏР·Р°РЅРЅРѕСЃС‚Рё"], answer: 1 },
      { q: "В«Ich will schlafenВ» Р·РЅР°С‡РёС‚:", options: ["РЇ РґРѕР»Р¶РµРЅ СЃРїР°С‚СЊ", "РЇ СѓРјРµСЋ СЃРїР°С‚СЊ", "РЇ С…РѕС‡Сѓ СЃРїР°С‚СЊ", "РЇ РјРѕРіСѓ СЃРїР°С‚СЊ"], answer: 2 },
    ],
  },

  // в”Ђв”Ђ A2 в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ
  {
    id: "perfekt",
    title: "РџСЂРѕС€РµРґС€РµРµ РІСЂРµРјСЏ (Perfekt)",
    emoji: "вЏ°",
    level: "A2",
    cards: [
      { title: "РљР°Рє РѕР±СЂР°Р·СѓРµС‚СЃСЏ Perfekt", body: "haben/sein + Partizip II\n\nIch habe gegessen. вЂ” РЇ РїРѕРµР».\nIch bin gegangen. вЂ” РЇ СѓС€С‘Р».\n\nРџСЂР°РІРёР»Рѕ haben:\nIch habe gemacht вЂ” СЏ СЃРґРµР»Р°Р»\nIch habe gekauft вЂ” СЏ РєСѓРїРёР»\n\nРџСЂР°РІРёР»Рѕ sein (РґРІРёР¶РµРЅРёРµ/РёР·РјРµРЅРµРЅРёРµ):\nIch bin gefahren вЂ” СЏ РїРѕРµС…Р°Р»\nIch bin aufgestanden вЂ” СЏ РІСЃС‚Р°Р»" },
      { title: "Partizip II вЂ” РєР°Рє РѕР±СЂР°Р·РѕРІР°С‚СЊ", body: "РЎР»Р°Р±С‹Рµ РіР»Р°РіРѕР»С‹:\nge- + РѕСЃРЅРѕРІР° + -(e)t\nmachen в†’ gemacht\nkaufen в†’ gekauft\narbeiten в†’ gearbeitet\n\nРЎРёР»СЊРЅС‹Рµ РіР»Р°РіРѕР»С‹ (РјРµРЅСЏСЋС‚ РєРѕСЂРµРЅСЊ):\ngehen в†’ gegangen\nessen в†’ gegessen\nschreiben в†’ geschrieben\nsehen в†’ gesehen\n\nрџ’Ў РЎРёР»СЊРЅС‹Рµ РіР»Р°РіРѕР»С‹ РЅР°РґРѕ СѓС‡РёС‚СЊ РЅР°РёР·СѓСЃС‚СЊ!" },
    ],
    exam: [
      { q: "В«Ich habe gegessenВ» вЂ” СЌС‚Рѕ:", options: ["РЇ РµРј", "РЇ РїРѕРµР»", "РЇ Р±СѓРґСѓ РµСЃС‚СЊ", "РЇ С…РѕС‡Сѓ РµСЃС‚СЊ"], answer: 1 },
      { q: "РЎ РєР°РєРёРј РІСЃРїРѕРјРѕРіР°С‚РµР»СЊРЅС‹Рј РіР»Р°РіРѕР»РѕРј РёСЃРїРѕР»СЊР·СѓРµС‚СЃСЏ В«gehenВ» РІ Perfekt?", options: ["haben", "sein", "werden", "machen"], answer: 1 },
      { q: "Partizip II РѕС‚ В«machenВ» вЂ” СЌС‚Рѕ:", options: ["gemacht", "gemachen", "macht", "mГ¤chte"], answer: 0 },
      { q: "В«Ich bin gefahrenВ» Р·РЅР°С‡РёС‚:", options: ["РЇ РµРґСѓ", "РЇ РїРѕРµС…Р°Р»", "РЇ С…РѕС‡Сѓ РµС…Р°С‚СЊ", "РЇ СѓРјРµСЋ РµС…Р°С‚СЊ"], answer: 1 },
      { q: "Partizip II СЃР»Р°Р±С‹С… РіР»Р°РіРѕР»РѕРІ РѕР±СЂР°Р·СѓРµС‚СЃСЏ РїРѕ СЃС…РµРјРµ:", options: ["ge- + РѕСЃРЅРѕРІР° + -en", "ge- + РѕСЃРЅРѕРІР° + -(e)t", "РѕСЃРЅРѕРІР° + -t", "ge- + РѕСЃРЅРѕРІР°"], answer: 1 },
    ],
  },
  {
    id: "dativ",
    title: "Р”Р°С‚РµР»СЊРЅС‹Р№ РїР°РґРµР¶ (Dativ)",
    emoji: "рџ“¦",
    level: "A2",
    cards: [
      { title: "Р§С‚Рѕ С‚Р°РєРѕРµ Dativ", body: "Dativ = РєРѕРјСѓ? С‡РµРјСѓ?\n\nder в†’ dem (Рј.СЂ.)\ndie в†’ der (Р¶.СЂ.)\ndas в†’ dem (СЃСЂ.СЂ.)\ndie (РјРЅ.С‡.) в†’ den + -n\n\nРџСЂРёРјРµСЂС‹:\nIch helfe dem Mann. вЂ” РЇ РїРѕРјРѕРіР°СЋ РјСѓР¶С‡РёРЅРµ.\nIch gebe der Frau das Buch. вЂ” РЇ РґР°СЋ Р¶РµРЅС‰РёРЅРµ РєРЅРёРіСѓ.\nIch danke dem Kind. вЂ” РЇ Р±Р»Р°РіРѕРґР°СЂСЋ СЂРµР±С‘РЅРєР°." },
      { title: "РџСЂРµРґР»РѕРіРё СЃ Dativ", body: "РџСЂРµРґР»РѕРіРё РєРѕС‚РѕСЂС‹Рµ Р’РЎР•Р“Р”Рђ С‚СЂРµР±СѓСЋС‚ Dativ:\nmit вЂ” СЃ (mit dem Bus)\nnach вЂ” РїРѕСЃР»Рµ / РІ (nach der Schule)\nbei вЂ” Сѓ / РїСЂРё (bei meiner Mutter)\nvon вЂ” РѕС‚ / РёР· (von dem Lehrer)\nzu вЂ” Рє / РґРѕ (zu Hause)\naus вЂ” РёР· (aus Deutschland)\nseit вЂ” СЃ (СЃ С‚РµС… РїРѕСЂ РєР°Рє)\nauГџer вЂ” РєСЂРѕРјРµ" },
    ],
    exam: [
      { q: "В«DemВ» вЂ” СЌС‚Рѕ Dativ РѕС‚:", options: ["die", "der/das", "die (РјРЅ.С‡.)", "ein"], answer: 1 },
      { q: "В«Ich helfe ___ FrauВ» вЂ” РІСЃС‚Р°РІСЊ Р°СЂС‚РёРєР»СЊ РІ Dativ:", options: ["die", "der", "das", "dem"], answer: 1 },
      { q: "РљР°РєРѕР№ РїСЂРµРґР»РѕРі Р’РЎР•Р“Р”Рђ С‚СЂРµР±СѓРµС‚ Dativ?", options: ["durch", "fГјr", "mit", "ohne"], answer: 2 },
      { q: "В«Zu HauseВ» Р·РЅР°С‡РёС‚:", options: ["РґРѕРјРѕР№", "РёР· РґРѕРјР°", "РґРѕРјР°", "Сѓ РґРѕРјР°"], answer: 2 },
      { q: "В«SeitВ» СЃ Dativ РѕР·РЅР°С‡Р°РµС‚:", options: ["РїРѕСЃР»Рµ", "СЃ (РЅР°С‡Р°Р»Рѕ РґРµР№СЃС‚РІРёСЏ РґРѕ СЃРµР№С‡Р°СЃ)", "РёР·", "Сѓ"], answer: 1 },
    ],
  },
  {
    id: "akkusativ",
    title: "Р’РёРЅРёС‚РµР»СЊРЅС‹Р№ РїР°РґРµР¶ (Akkusativ)",
    emoji: "рџЋЇ",
    level: "A2",
    cards: [
      { title: "Р§С‚Рѕ С‚Р°РєРѕРµ Akkusativ", body: "Akkusativ = РєРѕРіРѕ? С‡С‚Рѕ?\n\nРњРµРЅСЏРµС‚СЃСЏ С‚РѕР»СЊРєРѕ РјСѓР¶СЃРєРѕР№ СЂРѕРґ:\nder в†’ den\n\ndie в†’ die (РЅРµ РјРµРЅСЏРµС‚СЃСЏ)\ndas в†’ das (РЅРµ РјРµРЅСЏРµС‚СЃСЏ)\n\nРџСЂРёРјРµСЂС‹:\nIch sehe den Mann. вЂ” РЇ РІРёР¶Сѓ РјСѓР¶С‡РёРЅСѓ.\nIch kaufe die Tasche. вЂ” РЇ РїРѕРєСѓРїР°СЋ СЃСѓРјРєСѓ.\nIch lese das Buch. вЂ” РЇ С‡РёС‚Р°СЋ РєРЅРёРіСѓ.\nein в†’ einen (Рј.СЂ.)" },
      { title: "РџСЂРµРґР»РѕРіРё СЃ Akkusativ", body: "РџСЂРµРґР»РѕРіРё РєРѕС‚РѕСЂС‹Рµ Р’РЎР•Р“Р”Рђ С‚СЂРµР±СѓСЋС‚ Akkusativ:\ndurch вЂ” С‡РµСЂРµР· (durch den Park)\nfГјr вЂ” РґР»СЏ (fГјr mich)\ngegen вЂ” РїСЂРѕС‚РёРІ (gegen den Wind)\nohne вЂ” Р±РµР· (ohne dich)\num вЂ” РІРѕРєСЂСѓРі (um die Ecke)\n\nрџ’Ў Р—Р°РїРѕРјРЅРё: durch-fГјr-gegen-ohne-um\n= РІСЃРµ СЃ Akkusativ!" },
    ],
    exam: [
      { q: "В«Ich sehe ___ MannВ» вЂ” РІСЃС‚Р°РІСЊ Р°СЂС‚РёРєР»СЊ РІ Akkusativ:", options: ["der", "dem", "den", "des"], answer: 2 },
      { q: "Р’ Akkusativ РјРµРЅСЏРµС‚СЃСЏ С‚РѕР»СЊРєРѕ:", options: ["РјСѓР¶СЃРєРѕР№ СЂРѕРґ", "Р¶РµРЅСЃРєРёР№ СЂРѕРґ", "СЃСЂРµРґРЅРёР№ СЂРѕРґ", "РІСЃРµ СЂРѕРґС‹"], answer: 0 },
      { q: "В«FГјrВ» С‚СЂРµР±СѓРµС‚:", options: ["Nominativ", "Dativ", "Akkusativ", "Genitiv"], answer: 2 },
      { q: "В«Ohne dichВ» Р·РЅР°С‡РёС‚:", options: ["СЃ С‚РѕР±РѕР№", "РґР»СЏ С‚РµР±СЏ", "РїСЂРѕС‚РёРІ С‚РµР±СЏ", "Р±РµР· С‚РµР±СЏ"], answer: 3 },
      { q: "В«EinenВ» вЂ” СЌС‚Рѕ Akkusativ РѕС‚:", options: ["die", "das", "ein (Рј.СЂ.)", "kein"], answer: 2 },
    ],
  },
  {
    id: "separable_verbs",
    title: "Р Р°Р·РґРµР»СЏРµРјС‹Рµ РіР»Р°РіРѕР»С‹",
    emoji: "вњ‚пёЏ",
    level: "A2",
    cards: [
      { title: "Р§С‚Рѕ С‚Р°РєРѕРµ СЂР°Р·РґРµР»СЏРµРјС‹Рµ РіР»Р°РіРѕР»С‹", body: "РџСЂРёСЃС‚Р°РІРєР° РѕС‚РґРµР»СЏРµС‚СЃСЏ Рё РёРґС‘С‚ Р’ РљРћРќР•Р¦:\n\naufstehen вЂ” РІСЃС‚Р°РІР°С‚СЊ\nIch stehe um 7 auf. вЂ” РЇ РІСЃС‚Р°СЋ РІ 7.\n\nanrufen вЂ” Р·РІРѕРЅРёС‚СЊ\nIch rufe dich an. вЂ” РЇ С‚РµР±Рµ РїРѕР·РІРѕРЅСЋ.\n\neinkaufen вЂ” РґРµР»Р°С‚СЊ РїРѕРєСѓРїРєРё\nIch kaufe heute ein. вЂ” РЎРµРіРѕРґРЅСЏ СЏ РёРґСѓ Р·Р° РїРѕРєСѓРїРєР°РјРё.\n\nabfahren вЂ” РѕС‚РїСЂР°РІР»СЏС‚СЊСЃСЏ\nDer Zug fГ¤hrt um 10 ab." },
      { title: "Р§Р°СЃС‚С‹Рµ СЂР°Р·РґРµР»СЏРµРјС‹Рµ РіР»Р°РіРѕР»С‹", body: "aufmachen вЂ” РѕС‚РєСЂС‹РІР°С‚СЊ\nzumachen вЂ” Р·Р°РєСЂС‹РІР°С‚СЊ\nankommen вЂ” РїСЂРёР±С‹РІР°С‚СЊ\naussteigen вЂ” РІС‹С…РѕРґРёС‚СЊ (РёР· С‚СЂР°РЅСЃРїРѕСЂС‚Р°)\neinsteigen вЂ” РІС…РѕРґРёС‚СЊ (РІ С‚СЂР°РЅСЃРїРѕСЂС‚)\nfernsehen вЂ” СЃРјРѕС‚СЂРµС‚СЊ С‚РµР»РµРІРёР·РѕСЂ\naufrГ¤umen вЂ” СѓР±РёСЂР°С‚СЊ (РєРѕРјРЅР°С‚Сѓ)\nmitnehmen вЂ” Р±СЂР°С‚СЊ СЃ СЃРѕР±РѕР№\n\nрџ’Ў Р’ РёРЅС„РёРЅРёС‚РёРІРµ Рё Partizip II РїСЂРёСЃС‚Р°РІРєР° СЃРѕС…СЂР°РЅСЏРµС‚СЃСЏ!" },
    ],
    exam: [
      { q: "В«Ich stehe um 7 ___В» (aufstehen) вЂ” РєСѓРґР° РёРґС‘С‚ РїСЂРёСЃС‚Р°РІРєР°?", options: ["Р’ РЅР°С‡Р°Р»Рѕ", "РџРѕСЃР»Рµ РїРѕРґР»РµР¶Р°С‰РµРіРѕ", "Р’ РєРѕРЅРµС† РїСЂРµРґР»РѕР¶РµРЅРёСЏ", "РџРѕСЃР»Рµ РіР»Р°РіРѕР»Р°"], answer: 2 },
      { q: "В«AnrufenВ» Р·РЅР°С‡РёС‚:", options: ["РїСЂРёС…РѕРґРёС‚СЊ", "Р·РІРѕРЅРёС‚СЊ", "РѕС‚РІРµС‡Р°С‚СЊ", "РєСЂРёС‡Р°С‚СЊ"], answer: 1 },
      { q: "В«Der Zug fГ¤hrt abВ» вЂ” СЌС‚Рѕ С„РѕСЂРјР° РіР»Р°РіРѕР»Р°:", options: ["anfahren", "abfahren", "auffahren", "einfahren"], answer: 1 },
      { q: "В«AussteigenВ» Р·РЅР°С‡РёС‚:", options: ["РІС…РѕРґРёС‚СЊ РІ С‚СЂР°РЅСЃРїРѕСЂС‚", "РІС‹С…РѕРґРёС‚СЊ РёР· С‚СЂР°РЅСЃРїРѕСЂС‚Р°", "РїРµСЂРµСЃР°Р¶РёРІР°С‚СЊСЃСЏ", "РѕРїР°Р·РґС‹РІР°С‚СЊ"], answer: 1 },
      { q: "В«Ich kaufe heute einВ» вЂ” СЌС‚Рѕ С„РѕСЂРјР° РіР»Р°РіРѕР»Р°:", options: ["ankaufen", "aufkaufen", "einkaufen", "verkaufen"], answer: 2 },
    ],
  },
  {
    id: "weather",
    title: "РџРѕРіРѕРґР°",
    emoji: "рџЊ¤пёЏ",
    level: "A2",
    cards: [
      { title: "РџРѕРіРѕРґР°", body: "die Sonne вЂ” СЃРѕР»РЅС†Рµ\nder Regen вЂ” РґРѕР¶РґСЊ\nder Schnee вЂ” СЃРЅРµРі\nder Wind вЂ” РІРµС‚РµСЂ\nder Nebel вЂ” С‚СѓРјР°РЅ\ndas Gewitter вЂ” РіСЂРѕР·Р°\ndie Wolke вЂ” РѕР±Р»Р°РєРѕ\n\nEs ist sonnig. вЂ” РЎРѕР»РЅРµС‡РЅРѕ.\nEs regnet. вЂ” РРґС‘С‚ РґРѕР¶РґСЊ.\nEs schneit. вЂ” РРґС‘С‚ СЃРЅРµРі.\nEs ist windig. вЂ” Р’РµС‚СЂРµРЅРѕ." },
      { title: "РўРµРјРїРµСЂР°С‚СѓСЂР° Рё РїСЂРѕРіРЅРѕР·", body: "Wie ist das Wetter heute? вЂ” РљР°РєР°СЏ СЃРµРіРѕРґРЅСЏ РїРѕРіРѕРґР°?\nEs ist warm/kalt/heiГџ. вЂ” РўРµРїР»Рѕ/С…РѕР»РѕРґРЅРѕ/Р¶Р°СЂРєРѕ.\nEs sind 20 Grad. вЂ” 20 РіСЂР°РґСѓСЃРѕРІ.\nDer Wetterbericht sagt... вЂ” РџСЂРѕРіРЅРѕР· РіРѕРІРѕСЂРёС‚...\n\nheiГџ вЂ” Р¶Р°СЂРєРѕ (РІС‹С€Рµ 30В°)\nwarm вЂ” С‚РµРїР»Рѕ (15-25В°)\nkГјhl вЂ” РїСЂРѕС…Р»Р°РґРЅРѕ (10-15В°)\nkalt вЂ” С…РѕР»РѕРґРЅРѕ (РЅРёР¶Рµ 10В°)" },
    ],
    exam: [
      { q: "В«Es regnetВ» Р·РЅР°С‡РёС‚:", options: ["РРґС‘С‚ СЃРЅРµРі", "РРґС‘С‚ РґРѕР¶РґСЊ", "Р’РµС‚СЂРµРЅРѕ", "РЎРѕР»РЅРµС‡РЅРѕ"], answer: 1 },
      { q: "В«Das GewitterВ» вЂ” СЌС‚Рѕ:", options: ["С‚СѓРјР°РЅ", "РѕР±Р»Р°РєРѕ", "РіСЂРѕР·Р°", "РІРµС‚РµСЂ"], answer: 2 },
      { q: "РљР°Рє СЃРїСЂРѕСЃРёС‚СЊ Рѕ РїРѕРіРѕРґРµ?", options: ["Was ist Wetter?", "Wie ist das Wetter?", "Wann ist Wetter?", "Wo ist das Wetter?"], answer: 1 },
      { q: "В«Es ist heiГџВ» Р·РЅР°С‡РёС‚:", options: ["С…РѕР»РѕРґРЅРѕ", "РїСЂРѕС…Р»Р°РґРЅРѕ", "С‚РµРїР»Рѕ", "Р¶Р°СЂРєРѕ"], answer: 3 },
      { q: "В«Es schneitВ» Р·РЅР°С‡РёС‚:", options: ["РРґС‘С‚ РґРѕР¶РґСЊ", "РРґС‘С‚ СЃРЅРµРі", "РўСѓРјР°РЅ", "Р’РµС‚РµСЂ"], answer: 1 },
    ],
  },
  {
    id: "travel",
    title: "РџСѓС‚РµС€РµСЃС‚РІРёСЏ",
    emoji: "вњ€пёЏ",
    level: "A2",
    cards: [
      { title: "Р’ РѕС‚РµР»Рµ", body: "das Hotel вЂ” РѕС‚РµР»СЊ\ndas Zimmer вЂ” РЅРѕРјРµСЂ\ndie Rezeption вЂ” СЂРµСЃРµРїС€РЅ\nIch habe ein Zimmer reserviert. вЂ” РЇ Р·Р°Р±СЂРѕРЅРёСЂРѕРІР°Р» РЅРѕРјРµСЂ.\nFГјr wie viele NГ¤chte? вЂ” РќР° СЃРєРѕР»СЊРєРѕ РЅРѕС‡РµР№?\nder SchlГјssel вЂ” РєР»СЋС‡\ndas FrГјhstГјck вЂ” Р·Р°РІС‚СЂР°Рє\nIst das FrГјhstГјck inklusive? вЂ” Р—Р°РІС‚СЂР°Рє РІРєР»СЋС‡С‘РЅ?" },
      { title: "РџСѓС‚РµС€РµСЃС‚РІРёРµ", body: "der Reisepass вЂ” РїР°СЃРїРѕСЂС‚\ndas Visum вЂ” РІРёР·Р°\nder Koffer вЂ” С‡РµРјРѕРґР°РЅ\ndie Unterkunft вЂ” Р¶РёР»СЊС‘\ndie SehenswГјrdigkeit вЂ” РґРѕСЃС‚РѕРїСЂРёРјРµС‡Р°С‚РµР»СЊРЅРѕСЃС‚СЊ\nbesichtigen вЂ” РѕСЃРјР°С‚СЂРёРІР°С‚СЊ\nder Stadtplan вЂ” РєР°СЂС‚Р° РіРѕСЂРѕРґР°\nWo ist...? вЂ” Р“РґРµ РЅР°С…РѕРґРёС‚СЃСЏ...?" },
    ],
    exam: [
      { q: "В«Ich habe ein Zimmer reserviertВ» Р·РЅР°С‡РёС‚:", options: ["РЇ РёС‰Сѓ РЅРѕРјРµСЂ", "РЇ Р·Р°Р±СЂРѕРЅРёСЂРѕРІР°Р» РЅРѕРјРµСЂ", "РЇ С…РѕС‡Сѓ РЅРѕРјРµСЂ", "РњРЅРµ РЅСѓР¶РµРЅ РЅРѕРјРµСЂ"], answer: 1 },
      { q: "В«Das FrГјhstГјck ist inklusiveВ» Р·РЅР°С‡РёС‚:", options: ["Р·Р°РІС‚СЂР°Рє РїР»Р°С‚РЅС‹Р№", "Р·Р°РІС‚СЂР°Рє РІРєР»СЋС‡С‘РЅ", "Р·Р°РІС‚СЂР°Рє РЅРµ РїСЂРµРґРѕСЃС‚Р°РІР»СЏРµС‚СЃСЏ", "Р·Р°РІС‚СЂР°Рє РѕРїС†РёРѕРЅР°Р»СЊРЅС‹Р№"], answer: 1 },
      { q: "В«Die SehenswГјrdigkeitВ» вЂ” СЌС‚Рѕ:", options: ["РѕС‚РµР»СЊ", "СЂРµСЃС‚РѕСЂР°РЅ", "РґРѕСЃС‚РѕРїСЂРёРјРµС‡Р°С‚РµР»СЊРЅРѕСЃС‚СЊ", "РєР°СЂС‚Р°"], answer: 2 },
      { q: "В«Der ReisepassВ» вЂ” СЌС‚Рѕ:", options: ["Р±РёР»РµС‚", "РІРёР·Р°", "РїР°СЃРїРѕСЂС‚", "С‡РµРјРѕРґР°РЅ"], answer: 2 },
      { q: "В«BesichtigenВ» Р·РЅР°С‡РёС‚:", options: ["Р±СЂРѕРЅРёСЂРѕРІР°С‚СЊ", "РїСѓС‚РµС€РµСЃС‚РІРѕРІР°С‚СЊ", "РѕСЃРјР°С‚СЂРёРІР°С‚СЊ", "С„РѕС‚РѕРіСЂР°С„РёСЂРѕРІР°С‚СЊ"], answer: 2 },
    ],
  },
  {
    id: "adjectives",
    title: "РЎСЂР°РІРЅРµРЅРёРµ РїСЂРёР»Р°РіР°С‚РµР»СЊРЅС‹С…",
    emoji: "рџ“Љ",
    level: "A2",
    cards: [
      { title: "РЎСЂР°РІРЅРёС‚РµР»СЊРЅР°СЏ СЃС‚РµРїРµРЅСЊ", body: "Р”РѕР±Р°РІР»СЏРµРј -er:\nschnell в†’ schneller (Р±С‹СЃС‚СЂРµРµ)\nklein в†’ kleiner (РјРµРЅСЊС€Рµ)\nalt в†’ Г¤lter (СЃС‚Р°СЂС€Рµ) в†ђ СѓРјР»Р°СѓС‚!\ngroГџ в†’ grГ¶Гџer (Р±РѕР»СЊС€Рµ)\n\nA ist ... als B вЂ” A ... С‡РµРј B:\nIch bin grГ¶Гџer als du. вЂ” РЇ РІС‹С€Рµ С‚РµР±СЏ.\nDer Zug ist schneller als der Bus.\nРџРѕРµР·Рґ Р±С‹СЃС‚СЂРµРµ Р°РІС‚РѕР±СѓСЃР°." },
      { title: "РџСЂРµРІРѕСЃС…РѕРґРЅР°СЏ СЃС‚РµРїРµРЅСЊ", body: "am ...-sten / der/die/das ...-ste\n\nschnell в†’ am schnellsten (Р±С‹СЃС‚СЂРµРµ РІСЃРµРіРѕ)\ngroГџ в†’ am grГ¶Гџten (СЃР°РјС‹Р№ Р±РѕР»СЊС€РѕР№)\nalt в†’ am Г¤ltesten (СЃР°РјС‹Р№ СЃС‚Р°СЂС‹Р№)\n\nРќРµРїСЂР°РІРёР»СЊРЅС‹Рµ:\ngut в†’ besser в†’ am besten\nviel в†’ mehr в†’ am meisten\ngern в†’ lieber в†’ am liebsten\n\nрџ’Ў gut/viel/gern вЂ” СѓС‡Рё РѕС‚РґРµР»СЊРЅРѕ!" },
    ],
    exam: [
      { q: "РЎСЂР°РІРЅРёС‚РµР»СЊРЅР°СЏ СЃС‚РµРїРµРЅСЊ РѕС‚ В«schnellВ» вЂ” СЌС‚Рѕ:", options: ["schnellst", "schneller", "schnellste", "mehr schnell"], answer: 1 },
      { q: "В«Ich bin grГ¶Гџer als duВ» Р·РЅР°С‡РёС‚:", options: ["РЇ С‚Р°РєРѕР№ Р¶Рµ РІС‹СЃРѕРєРёР№ РєР°Рє С‚С‹", "РЇ РЅРёР¶Рµ С‚РµР±СЏ", "РЇ РІС‹С€Рµ С‚РµР±СЏ", "РўС‹ РІС‹С€Рµ РјРµРЅСЏ"], answer: 2 },
      { q: "РџСЂРµРІРѕСЃС…РѕРґРЅР°СЏ СЃС‚РµРїРµРЅСЊ РѕС‚ В«gutВ» вЂ” СЌС‚Рѕ:", options: ["guter", "am gutsten", "am besten", "am gutensten"], answer: 2 },
      { q: "В«LieberВ» вЂ” СЌС‚Рѕ СЃСЂР°РІРЅРёС‚РµР»СЊРЅР°СЏ СЃС‚РµРїРµРЅСЊ РѕС‚:", options: ["lieb", "gern", "viel", "gut"], answer: 1 },
      { q: "В«Am Г¤ltestenВ» вЂ” СЌС‚Рѕ РїСЂРµРІРѕСЃС…РѕРґРЅР°СЏ СЃС‚РµРїРµРЅСЊ РѕС‚:", options: ["alt", "Г¤lter", "alle", "alles"], answer: 0 },
    ],
  },
  {
    id: "subordinate",
    title: "РџСЂРёРґР°С‚РѕС‡РЅС‹Рµ РїСЂРµРґР»РѕР¶РµРЅРёСЏ",
    emoji: "рџ”—",
    level: "A2",
    cards: [
      { title: "РЎРѕСЋР·С‹ weil, dass, wenn", body: "weil вЂ” РїРѕС‚РѕРјСѓ С‡С‚Рѕ (РіР»Р°РіРѕР» РІ РєРѕРЅРµС†!)\nIch lerne Deutsch, weil ich in Deutschland wohne.\nРЇ СѓС‡Сѓ РЅРµРјРµС†РєРёР№, РїРѕС‚РѕРјСѓ С‡С‚Рѕ Р¶РёРІСѓ РІ Р“РµСЂРјР°РЅРёРё.\n\ndass вЂ” С‡С‚Рѕ\nIch denke, dass das richtig ist.\nРЇ РґСѓРјР°СЋ, С‡С‚Рѕ СЌС‚Рѕ РїСЂР°РІРёР»СЊРЅРѕ.\n\nwenn вЂ” РєРѕРіРґР° / РµСЃР»Рё\nWenn ich Zeit habe, lese ich.\nРљРѕРіРґР° Сѓ РјРµРЅСЏ РµСЃС‚СЊ РІСЂРµРјСЏ, СЏ С‡РёС‚Р°СЋ." },
      { title: "РџРѕСЂСЏРґРѕРє СЃР»РѕРІ РІ РїСЂРёРґР°С‚РѕС‡РЅРѕРј", body: "Р’ РїСЂРёРґР°С‚РѕС‡РЅРѕРј РїСЂРµРґР»РѕР¶РµРЅРёРё РіР»Р°РіРѕР» РёРґС‘С‚ Р’ РљРћРќР•Р¦:\n\nweil ich mГјde BIN (РЅРµ В«bin ichВ»)\ndass er kommen WILL\nwenn sie Zeit HAT\n\nрџ’Ў Р“Р»Р°РІРЅРѕРµ РїСЂРµРґР»РѕР¶РµРЅРёРµ + Р·Р°РїСЏС‚Р°СЏ + РїСЂРёРґР°С‚РѕС‡РЅРѕРµ\n\nIch bleibe zu Hause, weil es regnet.\nРЇ РѕСЃС‚Р°СЋСЃСЊ РґРѕРјР°, РїРѕС‚РѕРјСѓ С‡С‚Рѕ РёРґС‘С‚ РґРѕР¶РґСЊ." },
    ],
    exam: [
      { q: "В«Ich lerne Deutsch, ___ ich in Deutschland wohne.В» (РїРѕС‚РѕРјСѓ С‡С‚Рѕ)", options: ["wenn", "dass", "weil", "aber"], answer: 2 },
      { q: "Р“РґРµ РІ РїСЂРёРґР°С‚РѕС‡РЅРѕРј РїСЂРµРґР»РѕР¶РµРЅРёРё СЃС‚РѕРёС‚ РіР»Р°РіРѕР»?", options: ["РќР° РїРµСЂРІРѕРј РјРµСЃС‚Рµ", "РќР° РІС‚РѕСЂРѕРј РјРµСЃС‚Рµ", "Р’ РєРѕРЅС†Рµ", "РџРѕСЃР»Рµ СЃРѕСЋР·Р°"], answer: 2 },
      { q: "В«WennВ» РѕР·РЅР°С‡Р°РµС‚:", options: ["РїРѕС‚РѕРјСѓ С‡С‚Рѕ", "С‡С‚Рѕ", "РєРѕРіРґР°/РµСЃР»Рё", "С…РѕС‚СЏ"], answer: 2 },
      { q: "В«Ich denke, ___ du recht hast.В»", options: ["weil", "wenn", "dass", "ob"], answer: 2 },
      { q: "Р§С‚Рѕ РЅСѓР¶РЅРѕ РїРѕСЃС‚Р°РІРёС‚СЊ РјРµР¶РґСѓ РіР»Р°РІРЅС‹Рј Рё РїСЂРёРґР°С‚РѕС‡РЅС‹Рј РїСЂРµРґР»РѕР¶РµРЅРёРµРј?", options: ["С‚РѕС‡РєСѓ", "Р·Р°РїСЏС‚СѓСЋ", "РґРІРѕРµС‚РѕС‡РёРµ", "РЅРёС‡РµРіРѕ"], answer: 1 },
    ],
  },
];

function loadBlocks(key) {
  try {
    const saved = JSON.parse(localStorage.getItem(key) || "{}");
    const result = {};
    Object.keys(saved).forEach(k => {
      result[k] = new Set(Array.isArray(saved[k]) ? saved[k] : []);
    });
    return result;
  } catch { return {}; }
}

function CurriculumScreen({ onBack, completedTopics, onTopicDone, userId }) {
  const STORAGE_KEY = `duopar_blocks_${userId || "guest"}`;

  const [activeTopicId, setActiveTopicId] = useState(null);
  const [mode, setMode] = useState(null); // "detail" | "block" | "exam"
  const [activeBlockIdx, setActiveBlockIdx] = useState(null);
  const [completedBlocks, setCompletedBlocks] = useState(() => loadBlocks(STORAGE_KEY));

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
    return topic.cards.map(card => ({
      name: card.title,
      words: (() => {
        const ws = [];
        card.body.split("\n").forEach(l => {
          if (l.includes(" вЂ” ") && !l.startsWith("рџ’Ў") && !l.startsWith("вљ пёЏ") && !l.startsWith("вЂў")) {
            const parts = l.split(" вЂ” ");
            if (parts.length >= 2) {
              const de = parts[0].trim(), ru = parts[1].trim().replace(/\s*\(.*?\)/g, "");
              if (de && ru) ws.push({ de, ru, section: card.title });
            }
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
          <button onClick={() => { setMode(null); setActiveTopicId(null); }} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", fontSize: 13, cursor: "pointer", marginBottom: 40, padding: 0, display: "block" }}>в†ђ РќР°Р·Р°Рґ</button>
          <div style={{ fontSize: 56, marginBottom: 12 }}>{topic.emoji}</div>
          <div style={{ fontSize: 26, fontWeight: 800, color: "#fff", marginBottom: 6 }}>{topic.title}</div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", marginBottom: 36 }}>{done.size} РёР· {blocks.length} С‡Р°СЃС‚РµР№ РїСЂРѕР№РґРµРЅРѕ</div>

          {/* РЎРµРіРјРµРЅС‚РёСЂРѕРІР°РЅРЅР°СЏ РїРѕР»РѕСЃРєР° РїСЂРѕРіСЂРµСЃСЃР° */}
          <div style={{ display: "flex", gap: 6, marginBottom: 48 }}>
            {blocks.map((_, i) => (
              <div key={i} style={{ flex: 1, height: 8, borderRadius: 4, background: done.has(i) ? "#7C5CFC" : "rgba(255,255,255,0.1)", transition: "background 0.4s" }} />
            ))}
          </div>

          {!allDone ? (
            <button onClick={() => { setActiveBlockIdx(nextBlock); setMode("block"); }} style={{ width: "100%", padding: "18px", borderRadius: 16, background: "#7C5CFC", border: "none", color: "#fff", fontSize: 16, fontWeight: 700, cursor: "pointer" }}>
              {done.size === 0 ? "в–¶ РќР°С‡Р°С‚СЊ" : "в–¶ РџСЂРѕРґРѕР»Р¶РёС‚СЊ"}
            </button>
          ) : (
            <button onClick={() => setMode("exam")} style={{ width: "100%", padding: "18px", borderRadius: 16, background: "linear-gradient(135deg, #7C5CFC, #a78bfa)", border: "none", color: "#fff", fontSize: 16, fontWeight: 700, cursor: "pointer" }}>
              вљЎ РЎРґР°С‚СЊ СЌРєР·Р°РјРµРЅ
            </button>
          )}
          {done.size > 0 && !allDone && (
            <button onClick={() => { setActiveBlockIdx(0); setCompletedBlocks(p => ({ ...p, [activeTopicId]: new Set() })); setMode("block"); }} style={{ marginTop: 12, background: "none", border: "none", color: "rgba(255,255,255,0.25)", fontSize: 13, cursor: "pointer" }}>
              РќР°С‡Р°С‚СЊ СЃРЅР°С‡Р°Р»Р°
            </button>
          )}
        </div>
      );
    }
  }

  return (
    <div style={{ paddingTop: 40 }}>
      <button onClick={onBack} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", fontSize: 13, cursor: "pointer", marginBottom: 20, padding: 0 }}>в†ђ РќР°Р·Р°Рґ</button>
      <h1 style={{ fontSize: 26, fontWeight: 800, color: "#fff", margin: "0 0 4px" }}>РџСЂРѕРіСЂР°РјРјР°</h1>
      <div style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", marginBottom: 24 }}>{completedTopics.length} РёР· {CURRICULUM.length} С‚РµРј РїСЂРѕР№РґРµРЅРѕ</div>

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
                      <div style={{ fontSize: 26 }}>{examDone ? "вњ…" : topic.emoji}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>{i + 1}. {topic.title}</div>
                        <div style={{ fontSize: 11, color: examDone ? "#10b981" : inProgress ? "#a78bfa" : "rgba(255,255,255,0.3)", marginTop: 2 }}>
                          {examDone ? "Р­РєР·Р°РјРµРЅ СЃРґР°РЅ вњ“" : inProgress ? `${blocksDone} РёР· ${blocksTotal} С‡Р°СЃС‚РµР№` : `${blocksTotal} ${blocksTotal === 1 ? "С‡Р°СЃС‚СЊ" : blocksTotal < 5 ? "С‡Р°СЃС‚Рё" : "С‡Р°СЃС‚РµР№"}`}
                        </div>
                      </div>
                      <div style={{ color: "rgba(255,255,255,0.2)", fontSize: 14 }}>в†’</div>
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
    const lines = card.body.split("\n").filter(l => l.includes(" вЂ” ") && !l.startsWith("рџ’Ў") && !l.startsWith("вљ пёЏ") && !l.startsWith("вЂў"));
    lines.forEach(line => {
      const parts = line.split(" вЂ” ");
      if (parts.length >= 2) {
        const de = parts[0].trim();
        const ru = parts[1].trim().replace(/\s*\(.*?\)/g, "");
        if (de && ru) cards.push({ de, ru, section: card.title });
      }
    });
  });
  return cards.slice(0, 8);
}

function buildExamQuestions(topic) {
  const flashcards = parseFlashcards(topic);
  // mix flashcard words + hardcoded exam questions, deduplicate
  const wordQuestions = shuffle(flashcards).slice(0, 6).map(card => ({
    q: `РљР°Рє РїРµСЂРµРІРѕРґРёС‚СЃСЏ В«${card.de}В»?`,
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
        <div style={{ fontSize: 64, marginBottom: 16 }}>{passed ? "рџЋ‰" : "рџ…"}</div>
        <div style={{ fontSize: 24, fontWeight: 800, color: "#fff", marginBottom: 8 }}>{passed ? "РўРµРјР° РїСЂРѕР№РґРµРЅР°!" : "РџРѕРїСЂРѕР±СѓР№ РµС‰С‘ СЂР°Р·"}</div>
        <div style={{ fontSize: 15, color: "rgba(255,255,255,0.5)", marginBottom: 32 }}>{score} РёР· {total} РїСЂР°РІРёР»СЊРЅРѕ В· РЅСѓР¶РЅРѕ {passMark}+</div>
        {passed
          ? <button onClick={onPass} style={{ width: "100%", padding: "16px", borderRadius: 16, background: "#10b981", color: "#fff", border: "none", fontSize: 16, fontWeight: 700, cursor: "pointer" }}>РџСЂРѕРґРѕР»Р¶РёС‚СЊ в†’</button>
          : <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <button onClick={() => { setQi(0); setSelected(null); setScore(0); setFinished(false); }} style={{ width: "100%", padding: "16px", borderRadius: 16, background: "#7C5CFC", color: "#fff", border: "none", fontSize: 16, fontWeight: 700, cursor: "pointer" }}>РџРѕРїСЂРѕР±РѕРІР°С‚СЊ СЃРЅРѕРІР°</button>
              <button onClick={onBack} style={{ width: "100%", padding: "14px", borderRadius: 16, background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.5)", border: "none", fontSize: 14, cursor: "pointer" }}>в†ђ РЈС‡РёС‚СЊ РµС‰С‘ СЂР°Р·</button>
            </div>
        }
      </div>
    );
  }

  return (
    <div style={{ paddingTop: 40 }}>
      <button onClick={onBack} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", fontSize: 13, cursor: "pointer", marginBottom: 20, padding: 0 }}>в†ђ РќР°Р·Р°Рґ</button>
      <div style={{ fontSize: 12, color: "#f59e0b", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>вљЎ Р­РєР·Р°РјРµРЅ В· {topic.title}</div>
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
            if (isCorrect(opt, i)) { bg = "rgba(16,185,129,0.25)"; border = "#10b981"; color = "#10b981"; icon = "вњ“"; }
            else if (opt === selected) { bg = "rgba(239,68,68,0.25)"; border = "#ef4444"; color = "#ef4444"; icon = "вњ—"; }
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

// в”Ђв”Ђ РЎР›РћР’РђР Р¬ GOETHE A1/A2 в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ
const WORD_LEVELS = ["A1", "A2"];
const WORD_CATEGORIES = ["Р›СЋРґРё", "Р”РѕРј", "Р•РґР°", "Р“РѕСЂРѕРґ", "Р’СЂРµРјСЏ", "Р“Р»Р°РіРѕР»С‹", "РџСЂРёР»Р°РіР°С‚РµР»СЊРЅС‹Рµ", "Р Р°Р·РЅРѕРµ"];

const DICTIONARY = [
  // Р›Р®Р”Р
  { word: "die Frau", level: "A1", category: "Р›СЋРґРё", translation: "Р¶РµРЅС‰РёРЅР° / Р¶РµРЅР°", gender: "die", plural: "die Frauen", example: "Die Frau arbeitet hier.", exampleRu: "Р–РµРЅС‰РёРЅР° СЂР°Р±РѕС‚Р°РµС‚ Р·РґРµСЃСЊ.", tip: "Frau вЂ” С‚Р°РєР¶Рµ РІРµР¶Р»РёРІРѕРµ РѕР±СЂР°С‰РµРЅРёРµ В«РіРѕСЃРїРѕР¶Р°В»" },
  { word: "der Mann", level: "A1", category: "Р›СЋРґРё", translation: "РјСѓР¶С‡РёРЅР° / РјСѓР¶", gender: "der", plural: "die MГ¤nner", example: "Der Mann kauft Brot.", exampleRu: "РњСѓР¶С‡РёРЅР° РїРѕРєСѓРїР°РµС‚ С…Р»РµР±.", tip: "Mann СЃ РґРІРѕР№РЅС‹Рј n вЂ” РЅРµ РїСѓС‚Р°Р№ СЃ man (Р±РµР·Р»РёС‡РЅРѕРµ В«РѕРґРёРЅВ»)" },
  { word: "das Kind", level: "A1", category: "Р›СЋРґРё", translation: "СЂРµР±С‘РЅРѕРє", gender: "das", plural: "die Kinder", example: "Das Kind spielt im Garten.", exampleRu: "Р РµР±С‘РЅРѕРє РёРіСЂР°РµС‚ РІ СЃР°РґСѓ.", tip: "Kinder вЂ” РѕС‚СЃСЋРґР° В«KindergartenВ» (РґРµС‚СЃРєРёР№ СЃР°Рґ)" },
  { word: "der Freund", level: "A1", category: "Р›СЋРґРё", translation: "РґСЂСѓРі / РїР°СЂРµРЅСЊ", gender: "der", plural: "die Freunde", example: "Mein Freund wohnt in Berlin.", exampleRu: "РњРѕР№ РґСЂСѓРі Р¶РёРІС‘С‚ РІ Р‘РµСЂР»РёРЅРµ.", tip: "die Freundin вЂ” РїРѕРґСЂСѓРіР° / РґРµРІСѓС€РєР°" },
  { word: "die Familie", level: "A1", category: "Р›СЋРґРё", translation: "СЃРµРјСЊСЏ", gender: "die", plural: "die Familien", example: "Meine Familie ist groГџ.", exampleRu: "РњРѕСЏ СЃРµРјСЊСЏ Р±РѕР»СЊС€Р°СЏ.", tip: "РџРѕС…РѕР¶Рµ РЅР° СЂСѓСЃСЃРєРѕРµ В«С„Р°РјРёР»РёСЏВ», РЅРѕ Р·РЅР°С‡РёС‚ В«СЃРµРјСЊСЏВ»" },
  { word: "die Mutter", level: "A1", category: "Р›СЋРґРё", translation: "РјР°С‚СЊ", gender: "die", plural: "die MГјtter", example: "Meine Mutter kocht gut.", exampleRu: "РњРѕСЏ РјР°РјР° С…РѕСЂРѕС€Рѕ РіРѕС‚РѕРІРёС‚.", tip: "Mutti вЂ” Р»Р°СЃРєРѕРІРѕРµ В«РјР°РјРѕС‡РєР°В»" },
  { word: "der Vater", level: "A1", category: "Р›СЋРґРё", translation: "РѕС‚РµС†", gender: "der", plural: "die VГ¤ter", example: "Mein Vater arbeitet viel.", exampleRu: "РњРѕР№ РїР°РїР° РјРЅРѕРіРѕ СЂР°Р±РѕС‚Р°РµС‚.", tip: "Vati вЂ” Р»Р°СЃРєРѕРІРѕРµ В«РїР°РїРѕС‡РєР°В»" },
  { word: "der Bruder", level: "A1", category: "Р›СЋРґРё", translation: "Р±СЂР°С‚", gender: "der", plural: "die BrГјder", example: "Mein Bruder ist 10 Jahre alt.", exampleRu: "РњРѕРµРјСѓ Р±СЂР°С‚Сѓ 10 Р»РµС‚.", tip: "BrГјder вЂ” СѓРјР»Р°СѓС‚ РІ РјРЅРѕР¶РµСЃС‚РІРµРЅРЅРѕРј С‡РёСЃР»Рµ" },
  { word: "die Schwester", level: "A1", category: "Р›СЋРґРё", translation: "СЃРµСЃС‚СЂР°", gender: "die", plural: "die Schwestern", example: "Meine Schwester studiert Medizin.", exampleRu: "РњРѕСЏ СЃРµСЃС‚СЂР° СѓС‡РёС‚СЃСЏ РЅР° РІСЂР°С‡Р°.", tip: "Schwester вЂ” С‚Р°РєР¶Рµ В«РјРµРґСЃРµСЃС‚СЂР°В» РІ Р±РѕР»СЊРЅРёС†Рµ" },
  { word: "der Kollege", level: "A2", category: "Р›СЋРґРё", translation: "РєРѕР»Р»РµРіР° (Рј)", gender: "der", plural: "die Kollegen", example: "Mein Kollege ist sehr nett.", exampleRu: "РњРѕР№ РєРѕР»Р»РµРіР° РѕС‡РµРЅСЊ РїСЂРёСЏС‚РЅС‹Р№.", tip: "die Kollegin вЂ” РєРѕР»Р»РµРіР°-Р¶РµРЅС‰РёРЅР°" },

  // Р”РћРњ
  { word: "das Haus", level: "A1", category: "Р”РѕРј", translation: "РґРѕРј", gender: "das", plural: "die HГ¤user", example: "Das Haus ist groГџ.", exampleRu: "Р”РѕРј Р±РѕР»СЊС€РѕР№.", tip: "HГ¤user вЂ” СѓРјР»Р°СѓС‚ + er РІ РјРЅ.С‡." },
  { word: "die Wohnung", level: "A1", category: "Р”РѕРј", translation: "РєРІР°СЂС‚РёСЂР°", gender: "die", plural: "die Wohnungen", example: "Ich suche eine Wohnung.", exampleRu: "РЇ РёС‰Сѓ РєРІР°СЂС‚РёСЂСѓ.", tip: "wohnen (Р¶РёС‚СЊ) в†’ Wohnung (Р¶РёР»СЊС‘)" },
  { word: "das Zimmer", level: "A1", category: "Р”РѕРј", translation: "РєРѕРјРЅР°С‚Р°", gender: "das", plural: "die Zimmer", example: "Das Zimmer ist hell.", exampleRu: "РљРѕРјРЅР°С‚Р° СЃРІРµС‚Р»Р°СЏ.", tip: "РњРЅ.С‡. С‚Р°РєРѕРµ Р¶Рµ: die Zimmer" },
  { word: "die KГјche", level: "A1", category: "Р”РѕРј", translation: "РєСѓС…РЅСЏ", gender: "die", plural: "die KГјchen", example: "Wir essen in der KГјche.", exampleRu: "РњС‹ РµРґРёРј РЅР° РєСѓС…РЅРµ.", tip: "KГјche вЂ” С‚Р°РєР¶Рµ В«РєСѓС…РЅСЏВ» РєР°Рє СЃС‚РёР»СЊ РїСЂРёРіРѕС‚РѕРІР»РµРЅРёСЏ" },
  { word: "das Bett", level: "A1", category: "Р”РѕРј", translation: "РєСЂРѕРІР°С‚СЊ", gender: "das", plural: "die Betten", example: "Das Bett ist sehr bequem.", exampleRu: "РљСЂРѕРІР°С‚СЊ РѕС‡РµРЅСЊ СѓРґРѕР±РЅР°СЏ.", tip: "ins Bett gehen вЂ” РёРґС‚Рё СЃРїР°С‚СЊ" },
  { word: "der Tisch", level: "A1", category: "Р”РѕРј", translation: "СЃС‚РѕР»", gender: "der", plural: "die Tische", example: "Das Buch liegt auf dem Tisch.", exampleRu: "РљРЅРёРіР° Р»РµР¶РёС‚ РЅР° СЃС‚РѕР»Рµ.", tip: "Tisch РЅР°РєСЂС‹РІР°СЋС‚ (Tisch decken) Рє РѕР±РµРґСѓ" },
  { word: "der Stuhl", level: "A1", category: "Р”РѕРј", translation: "СЃС‚СѓР»", gender: "der", plural: "die StГјhle", example: "Setz dich auf den Stuhl!", exampleRu: "РЎР°РґРёСЃСЊ РЅР° СЃС‚СѓР»!", tip: "РќРµ РїСѓС‚Р°Р№ СЃ Sessel (РєСЂРµСЃР»Рѕ)" },
  { word: "das Fenster", level: "A1", category: "Р”РѕРј", translation: "РѕРєРЅРѕ", gender: "das", plural: "die Fenster", example: "Bitte mach das Fenster auf!", exampleRu: "РџРѕР¶Р°Р»СѓР№СЃС‚Р°, РѕС‚РєСЂРѕР№ РѕРєРЅРѕ!", tip: "РњРЅ.С‡. С‚Р°РєРѕРµ Р¶Рµ: die Fenster" },
  { word: "die TГјr", level: "A1", category: "Р”РѕРј", translation: "РґРІРµСЂСЊ", gender: "die", plural: "die TГјren", example: "Die TГјr ist zu.", exampleRu: "Р”РІРµСЂСЊ Р·Р°РєСЂС‹С‚Р°.", tip: "zu = Р·Р°РєСЂС‹С‚Рѕ, auf = РѕС‚РєСЂС‹С‚Рѕ" },
  { word: "der SchlГјssel", level: "A1", category: "Р”РѕРј", translation: "РєР»СЋС‡", gender: "der", plural: "die SchlГјssel", example: "Ich habe meinen SchlГјssel vergessen.", exampleRu: "РЇ Р·Р°Р±С‹Р» СЃРІРѕР№ РєР»СЋС‡.", tip: "РњРЅ.С‡. С‚Р°РєРѕРµ Р¶Рµ: die SchlГјssel" },
  { word: "das Bad", level: "A1", category: "Р”РѕРј", translation: "РІР°РЅРЅР°СЏ", gender: "das", plural: "die BГ¤der", example: "Das Bad ist links.", exampleRu: "Р’Р°РЅРЅР°СЏ СЃР»РµРІР°.", tip: "Baden = РєСѓРїР°С‚СЊСЃСЏ; Bad = РІР°РЅРЅР°СЏ РёР»Рё РєСѓСЂРѕСЂС‚" },
  { word: "der KГјhlschrank", level: "A1", category: "Р”РѕРј", translation: "С…РѕР»РѕРґРёР»СЊРЅРёРє", gender: "der", plural: "die KГјhlschrГ¤nke", example: "Der KГјhlschrank ist leer.", exampleRu: "РҐРѕР»РѕРґРёР»СЊРЅРёРє РїСѓСЃС‚РѕР№.", tip: "kГјhl (РїСЂРѕС…Р»Р°РґРЅС‹Р№) + Schrank (С€РєР°С„)" },

  // Р•Р”Рђ
  { word: "das Brot", level: "A1", category: "Р•РґР°", translation: "С…Р»РµР±", gender: "das", plural: "die Brote", example: "Ich esse Brot zum FrГјhstГјck.", exampleRu: "РЇ РµРј С…Р»РµР± РЅР° Р·Р°РІС‚СЂР°Рє.", tip: "РќРµРјС†С‹ РµРґСЏС‚ С…Р»РµР± 2-3 СЂР°Р·Р° РІ РґРµРЅСЊ вЂ” СЌС‚Рѕ РѕСЃРЅРѕРІР°!" },
  { word: "die Milch", level: "A1", category: "Р•РґР°", translation: "РјРѕР»РѕРєРѕ", gender: "die", plural: "вЂ”", example: "Ich trinke Milch.", exampleRu: "РЇ РїСЊСЋ РјРѕР»РѕРєРѕ.", tip: "РћР±С‹С‡РЅРѕ Р±РµР· РјРЅРѕР¶РµСЃС‚РІРµРЅРЅРѕРіРѕ С‡РёСЃР»Р° (РЅРµСЃС‡С‘С‚РЅРѕРµ)" },
  { word: "das Wasser", level: "A1", category: "Р•РґР°", translation: "РІРѕРґР°", gender: "das", plural: "вЂ”", example: "Bitte ein Glas Wasser!", exampleRu: "РЎС‚Р°РєР°РЅ РІРѕРґС‹, РїРѕР¶Р°Р»СѓР№СЃС‚Р°!", tip: "Mineralwasser вЂ” РіР°Р·РёСЂРѕРІР°РЅРЅР°СЏ, Leitungswasser вЂ” РёР· РєСЂР°РЅР°" },
  { word: "der Kaffee", level: "A1", category: "Р•РґР°", translation: "РєРѕС„Рµ", gender: "der", plural: "вЂ”", example: "Ich trinke jeden Morgen Kaffee.", exampleRu: "РљР°Р¶РґРѕРµ СѓС‚СЂРѕ СЏ РїСЊСЋ РєРѕС„Рµ.", tip: "Р’ Р“РµСЂРјР°РЅРёРё РѕС‡РµРЅСЊ РїРѕРїСѓР»СЏСЂРµРЅ С„РёР»СЊС‚СЂ-РєРѕС„Рµ" },
  { word: "das Ei", level: "A1", category: "Р•РґР°", translation: "СЏР№С†Рѕ", gender: "das", plural: "die Eier", example: "Ich esse zwei Eier.", exampleRu: "РЇ РµРј РґРІР° СЏР№С†Р°.", tip: "Spiegelei вЂ” СЏРёС‡РЅРёС†Р°, RГјhrei вЂ” scrambled eggs" },
  { word: "der Apfel", level: "A1", category: "Р•РґР°", translation: "СЏР±Р»РѕРєРѕ", gender: "der", plural: "die Г„pfel", example: "Ein Apfel pro Tag hГ¤lt den Arzt fern.", exampleRu: "РЇР±Р»РѕРєРѕ РІ РґРµРЅСЊ вЂ” РґРѕРєС‚РѕСЂ РЅРµ РЅСѓР¶РµРЅ.", tip: "Г„pfel вЂ” СѓРјР»Р°СѓС‚ РІ РјРЅРѕР¶РµСЃС‚РІРµРЅРЅРѕРј С‡РёСЃР»Рµ" },
  { word: "das Fleisch", level: "A1", category: "Р•РґР°", translation: "РјСЏСЃРѕ", gender: "das", plural: "вЂ”", example: "Er isst kein Fleisch.", exampleRu: "РћРЅ РЅРµ РµСЃС‚ РјСЏСЃРѕ.", tip: "Fleischer вЂ” РјСЏСЃРЅРёРє (РїСЂРѕС„РµСЃСЃРёСЏ)" },
  { word: "der KГ¤se", level: "A1", category: "Р•РґР°", translation: "СЃС‹СЂ", gender: "der", plural: "die KГ¤se", example: "Ich mag KГ¤se sehr.", exampleRu: "РЇ РѕС‡РµРЅСЊ Р»СЋР±Р»СЋ СЃС‹СЂ.", tip: "РќРµРјРµС†РєРёР№ СЃС‹СЂ Р·РЅР°РјРµРЅРёС‚ вЂ” Emmentaler, Gouda" },
  { word: "das GemГјse", level: "A1", category: "Р•РґР°", translation: "РѕРІРѕС‰Рё", gender: "das", plural: "вЂ”", example: "Iss mehr GemГјse!", exampleRu: "Р•С€СЊ Р±РѕР»СЊС€Рµ РѕРІРѕС‰РµР№!", tip: "РћР±С‹С‡РЅРѕ Р±РµР· РјРЅ.С‡. вЂ” СЃРѕР±РёСЂР°С‚РµР»СЊРЅРѕРµ" },
  { word: "das Obst", level: "A1", category: "Р•РґР°", translation: "С„СЂСѓРєС‚С‹", gender: "das", plural: "вЂ”", example: "Obst ist gesund.", exampleRu: "Р¤СЂСѓРєС‚С‹ РїРѕР»РµР·РЅС‹.", tip: "РўРѕР¶Рµ СЃРѕР±РёСЂР°С‚РµР»СЊРЅРѕРµ, Р±РµР· РјРЅ.С‡." },
  { word: "die Suppe", level: "A1", category: "Р•РґР°", translation: "СЃСѓРї", gender: "die", plural: "die Suppen", example: "Die Suppe ist heiГџ.", exampleRu: "РЎСѓРї РіРѕСЂСЏС‡РёР№.", tip: "Nudelsuppe вЂ” СЃСѓРї СЃ Р»Р°РїС€РѕР№" },
  { word: "der Kuchen", level: "A1", category: "Р•РґР°", translation: "РїРёСЂРѕРі / С‚РѕСЂС‚", gender: "der", plural: "die Kuchen", example: "Zum Kaffee gibt es Kuchen.", exampleRu: "Рљ РєРѕС„Рµ РµСЃС‚СЊ РїРёСЂРѕРі.", tip: "Kaffee und Kuchen вЂ” РЅРµРјРµС†РєР°СЏ С‚СЂР°РґРёС†РёСЏ РїРѕР»РґРЅРёРєР°" },

  // Р“РћР РћР”
  { word: "die StraГџe", level: "A1", category: "Р“РѕСЂРѕРґ", translation: "СѓР»РёС†Р°", gender: "die", plural: "die StraГџen", example: "Die StraГџe ist breit.", exampleRu: "РЈР»РёС†Р° С€РёСЂРѕРєР°СЏ.", tip: "Р’ Р°РґСЂРµСЃРµ СЃРѕРєСЂР°С‰Р°СЋС‚: Str." },
  { word: "der Bahnhof", level: "A1", category: "Р“РѕСЂРѕРґ", translation: "РІРѕРєР·Р°Р»", gender: "der", plural: "die BahnhГ¶fe", example: "Der Zug fГ¤hrt vom Bahnhof ab.", exampleRu: "РџРѕРµР·Рґ РѕС‚РїСЂР°РІР»СЏРµС‚СЃСЏ СЃ РІРѕРєР·Р°Р»Р°.", tip: "Bahn (РїРѕРµР·Рґ) + Hof (РґРІРѕСЂ)" },
  { word: "die Haltestelle", level: "A1", category: "Р“РѕСЂРѕРґ", translation: "РѕСЃС‚Р°РЅРѕРІРєР°", gender: "die", plural: "die Haltestellen", example: "Die Haltestelle ist um die Ecke.", exampleRu: "РћСЃС‚Р°РЅРѕРІРєР° Р·Р° СѓРіР»РѕРј.", tip: "halten (РѕСЃС‚Р°РЅР°РІР»РёРІР°С‚СЊСЃСЏ) + Stelle (РјРµСЃС‚Рѕ)" },
  { word: "das Krankenhaus", level: "A1", category: "Р“РѕСЂРѕРґ", translation: "Р±РѕР»СЊРЅРёС†Р°", gender: "das", plural: "die KrankenhГ¤user", example: "Er liegt im Krankenhaus.", exampleRu: "РћРЅ Р»РµР¶РёС‚ РІ Р±РѕР»СЊРЅРёС†Рµ.", tip: "krank (Р±РѕР»СЊРЅРѕР№) + Haus (РґРѕРј)" },
  { word: "die Schule", level: "A1", category: "Р“РѕСЂРѕРґ", translation: "С€РєРѕР»Р°", gender: "die", plural: "die Schulen", example: "Die Kinder gehen in die Schule.", exampleRu: "Р”РµС‚Рё РёРґСѓС‚ РІ С€РєРѕР»Сѓ.", tip: "in die Schule gehen вЂ” СѓС‡РёС‚СЊСЃСЏ РІ С€РєРѕР»Рµ" },
  { word: "die UniversitГ¤t", level: "A2", category: "Р“РѕСЂРѕРґ", translation: "СѓРЅРёРІРµСЂСЃРёС‚РµС‚", gender: "die", plural: "die UniversitГ¤ten", example: "Sie studiert an der UniversitГ¤t.", exampleRu: "РћРЅР° СѓС‡РёС‚СЃСЏ РІ СѓРЅРёРІРµСЂСЃРёС‚РµС‚Рµ.", tip: "РЎРѕРєСЂР°С‰РµРЅРёРµ: die Uni" },
  { word: "das GeschГ¤ft", level: "A1", category: "Р“РѕСЂРѕРґ", translation: "РјР°РіР°Р·РёРЅ / РґРµР»Рѕ", gender: "das", plural: "die GeschГ¤fte", example: "Das GeschГ¤ft Г¶ffnet um 9 Uhr.", exampleRu: "РњР°РіР°Р·РёРЅ РѕС‚РєСЂС‹РІР°РµС‚СЃСЏ РІ 9.", tip: "РўР°РєР¶Рµ Р·РЅР°С‡РёС‚ В«Р±РёР·РЅРµСЃ, РґРµР»РѕВ»" },
  { word: "der Supermarkt", level: "A1", category: "Р“РѕСЂРѕРґ", translation: "СЃСѓРїРµСЂРјР°СЂРєРµС‚", gender: "der", plural: "die SupermГ¤rkte", example: "Ich kaufe im Supermarkt ein.", exampleRu: "РЇ РґРµР»Р°СЋ РїРѕРєСѓРїРєРё РІ СЃСѓРїРµСЂРјР°СЂРєРµС‚Рµ.", tip: "einkaufen вЂ” РґРµР»Р°С‚СЊ РїРѕРєСѓРїРєРё" },
  { word: "das Rathaus", level: "A2", category: "Р“РѕСЂРѕРґ", translation: "СЂР°С‚СѓС€Р°", gender: "das", plural: "die RathГ¤user", example: "Das Rathaus steht auf dem Marktplatz.", exampleRu: "Р Р°С‚СѓС€Р° СЃС‚РѕРёС‚ РЅР° СЂС‹РЅРѕС‡РЅРѕР№ РїР»РѕС‰Р°РґРё.", tip: "Rat (СЃРѕРІРµС‚) + Haus (РґРѕРј)" },
  { word: "die Post", level: "A1", category: "Р“РѕСЂРѕРґ", translation: "РїРѕС‡С‚Р°", gender: "die", plural: "вЂ”", example: "Ich schicke einen Brief per Post.", exampleRu: "РЇ РѕС‚РїСЂР°РІР»СЏСЋ РїРёСЃСЊРјРѕ РїРѕ РїРѕС‡С‚Рµ.", tip: "Auch: die Post = РїРѕС‡С‚РѕРІРѕРµ РѕС‚РґРµР»РµРЅРёРµ" },

  // Р’Р Р•РњРЇ
  { word: "die Uhr", level: "A1", category: "Р’СЂРµРјСЏ", translation: "С‡Р°СЃС‹ / С‡Р°СЃ", gender: "die", plural: "die Uhren", example: "Es ist 3 Uhr.", exampleRu: "РЎРµР№С‡Р°СЃ 3 С‡Р°СЃР°.", tip: "Um 3 Uhr = РІ 3 С‡Р°СЃР°" },
  { word: "der Tag", level: "A1", category: "Р’СЂРµРјСЏ", translation: "РґРµРЅСЊ", gender: "der", plural: "die Tage", example: "Guten Tag!", exampleRu: "Р”РѕР±СЂС‹Р№ РґРµРЅСЊ!", tip: "Guten Tag вЂ” РѕС„РёС†РёР°Р»СЊРЅРѕРµ РїСЂРёРІРµС‚СЃС‚РІРёРµ" },
  { word: "die Woche", level: "A1", category: "Р’СЂРµРјСЏ", translation: "РЅРµРґРµР»СЏ", gender: "die", plural: "die Wochen", example: "Ich arbeite fГјnf Tage pro Woche.", exampleRu: "РЇ СЂР°Р±РѕС‚Р°СЋ РїСЏС‚СЊ РґРЅРµР№ РІ РЅРµРґРµР»СЋ.", tip: "diese Woche вЂ” РЅР° СЌС‚РѕР№ РЅРµРґРµР»Рµ" },
  { word: "der Monat", level: "A1", category: "Р’СЂРµРјСЏ", translation: "РјРµСЃСЏС†", gender: "der", plural: "die Monate", example: "Im Monat Januar ist es kalt.", exampleRu: "Р’ СЏРЅРІР°СЂРµ С…РѕР»РѕРґРЅРѕ.", tip: "letzten Monat вЂ” РІ РїСЂРѕС€Р»РѕРј РјРµСЃСЏС†Рµ" },
  { word: "das Jahr", level: "A1", category: "Р’СЂРµРјСЏ", translation: "РіРѕРґ", gender: "das", plural: "die Jahre", example: "Das Jahr hat 12 Monate.", exampleRu: "Р’ РіРѕРґСѓ 12 РјРµСЃСЏС†РµРІ.", tip: "Ich bin 20 Jahre alt вЂ” РјРЅРµ 20 Р»РµС‚" },
  { word: "der Morgen", level: "A1", category: "Р’СЂРµРјСЏ", translation: "СѓС‚СЂРѕ", gender: "der", plural: "die Morgen", example: "Guten Morgen!", exampleRu: "Р”РѕР±СЂРѕРµ СѓС‚СЂРѕ!", tip: "morgens вЂ” РїРѕ СѓС‚СЂР°Рј; morgen вЂ” Р·Р°РІС‚СЂР° (РґСЂСѓРіРѕРµ СЃР»РѕРІРѕ!)" },
  { word: "der Abend", level: "A1", category: "Р’СЂРµРјСЏ", translation: "РІРµС‡РµСЂ", gender: "der", plural: "die Abende", example: "Guten Abend!", exampleRu: "Р”РѕР±СЂС‹Р№ РІРµС‡РµСЂ!", tip: "abends вЂ” РїРѕ РІРµС‡РµСЂР°Рј" },
  { word: "die Nacht", level: "A1", category: "Р’СЂРµРјСЏ", translation: "РЅРѕС‡СЊ", gender: "die", plural: "die NГ¤chte", example: "Gute Nacht!", exampleRu: "РЎРїРѕРєРѕР№РЅРѕР№ РЅРѕС‡Рё!", tip: "nachts вЂ” РЅРѕС‡СЊСЋ" },
  { word: "heute", level: "A1", category: "Р’СЂРµРјСЏ", translation: "СЃРµРіРѕРґРЅСЏ", gender: "вЂ”", plural: "вЂ”", example: "Heute ist Montag.", exampleRu: "РЎРµРіРѕРґРЅСЏ РїРѕРЅРµРґРµР»СЊРЅРёРє.", tip: "РќР°СЂРµС‡РёРµ, РЅРµ РёР·РјРµРЅСЏРµС‚СЃСЏ" },
  { word: "morgen", level: "A1", category: "Р’СЂРµРјСЏ", translation: "Р·Р°РІС‚СЂР°", gender: "вЂ”", plural: "вЂ”", example: "Morgen gehe ich zum Arzt.", exampleRu: "Р—Р°РІС‚СЂР° СЏ РёРґСѓ Рє РІСЂР°С‡Сѓ.", tip: "РќРµ РїСѓС‚Р°Р№ СЃ der Morgen (СѓС‚СЂРѕ)!" },
  { word: "gestern", level: "A1", category: "Р’СЂРµРјСЏ", translation: "РІС‡РµСЂР°", gender: "вЂ”", plural: "вЂ”", example: "Gestern war ich mГјde.", exampleRu: "Р’С‡РµСЂР° СЏ Р±С‹Р» СѓСЃС‚Р°РІС€РёРј.", tip: "vorgestern вЂ” РїРѕР·Р°РІС‡РµСЂР°" },

  // Р“Р›РђР“РћР›Р«
  { word: "gehen", level: "A1", category: "Р“Р»Р°РіРѕР»С‹", translation: "РёРґС‚Рё / РµС…Р°С‚СЊ", gender: "вЂ”", plural: "вЂ”", example: "Ich gehe in die Schule.", exampleRu: "РЇ РёРґСѓ РІ С€РєРѕР»Сѓ.", tip: "Perfekt СЃ sein: ich bin gegangen" },
  { word: "kommen", level: "A1", category: "Р“Р»Р°РіРѕР»С‹", translation: "РїСЂРёС…РѕРґРёС‚СЊ", gender: "вЂ”", plural: "вЂ”", example: "Woher kommst du?", exampleRu: "РћС‚РєСѓРґР° С‚С‹?", tip: "Perfekt СЃ sein: ich bin gekommen" },
  { word: "machen", level: "A1", category: "Р“Р»Р°РіРѕР»С‹", translation: "РґРµР»Р°С‚СЊ", gender: "вЂ”", plural: "вЂ”", example: "Was machst du heute?", exampleRu: "Р§С‚Рѕ С‚С‹ РґРµР»Р°РµС€СЊ СЃРµРіРѕРґРЅСЏ?", tip: "Perfekt СЃ haben: ich habe gemacht" },
  { word: "arbeiten", level: "A1", category: "Р“Р»Р°РіРѕР»С‹", translation: "СЂР°Р±РѕС‚Р°С‚СЊ", gender: "вЂ”", plural: "вЂ”", example: "Ich arbeite in einem BГјro.", exampleRu: "РЇ СЂР°Р±РѕС‚Р°СЋ РІ РѕС„РёСЃРµ.", tip: "du arbeitest (РЅРµ Р·Р°Р±СѓРґСЊ -e- РїРµСЂРµРґ -st)" },
  { word: "wohnen", level: "A1", category: "Р“Р»Р°РіРѕР»С‹", translation: "Р¶РёС‚СЊ / РїСЂРѕР¶РёРІР°С‚СЊ", gender: "вЂ”", plural: "вЂ”", example: "Ich wohne in MГјnchen.", exampleRu: "РЇ Р¶РёРІСѓ РІ РњСЋРЅС…РµРЅРµ.", tip: "Wohnung (РєРІР°СЂС‚РёСЂР°) вЂ” РѕС‚ С‚РѕРіРѕ Р¶Рµ РєРѕСЂРЅСЏ" },
  { word: "lernen", level: "A1", category: "Р“Р»Р°РіРѕР»С‹", translation: "СѓС‡РёС‚СЊ / СѓС‡РёС‚СЊСЃСЏ", gender: "вЂ”", plural: "вЂ”", example: "Ich lerne Deutsch.", exampleRu: "РЇ СѓС‡Сѓ РЅРµРјРµС†РєРёР№.", tip: "lernen = СѓС‡РёС‚СЊ (СЃР°РјРѕРјСѓ), lehren = СѓС‡РёС‚СЊ (РґСЂСѓРіРёС…)" },
  { word: "sprechen", level: "A1", category: "Р“Р»Р°РіРѕР»С‹", translation: "РіРѕРІРѕСЂРёС‚СЊ", gender: "вЂ”", plural: "вЂ”", example: "Sprichst du Deutsch?", exampleRu: "РўС‹ РіРѕРІРѕСЂРёС€СЊ РїРѕ-РЅРµРјРµС†РєРё?", tip: "du sprichst, er spricht вЂ” РєРѕСЂРЅРµРІРѕР№ СѓРјР»Р°СѓС‚!" },
  { word: "kaufen", level: "A1", category: "Р“Р»Р°РіРѕР»С‹", translation: "РїРѕРєСѓРїР°С‚СЊ", gender: "вЂ”", plural: "вЂ”", example: "Ich kaufe Brot im Supermarkt.", exampleRu: "РЇ РїРѕРєСѓРїР°СЋ С…Р»РµР± РІ СЃСѓРїРµСЂРјР°СЂРєРµС‚Рµ.", tip: "verkaufen = РїСЂРѕРґР°РІР°С‚СЊ (ver- РјРµРЅСЏРµС‚ СЃРјС‹СЃР» РЅР° РѕР±СЂР°С‚РЅС‹Р№)" },
  { word: "schreiben", level: "A1", category: "Р“Р»Р°РіРѕР»С‹", translation: "РїРёСЃР°С‚СЊ", gender: "вЂ”", plural: "вЂ”", example: "Ich schreibe einen Brief.", exampleRu: "РЇ РїРёС€Сѓ РїРёСЃСЊРјРѕ.", tip: "Perfekt: ich habe geschrieben" },
  { word: "lesen", level: "A1", category: "Р“Р»Р°РіРѕР»С‹", translation: "С‡РёС‚Р°С‚СЊ", gender: "вЂ”", plural: "вЂ”", example: "Ich lese ein Buch.", exampleRu: "РЇ С‡РёС‚Р°СЋ РєРЅРёРіСѓ.", tip: "du liest, er liest вЂ” РєРѕСЂРЅРµРІРѕРµ РёР·РјРµРЅРµРЅРёРµ!" },
  { word: "fahren", level: "A1", category: "Р“Р»Р°РіРѕР»С‹", translation: "РµС…Р°С‚СЊ", gender: "вЂ”", plural: "вЂ”", example: "Ich fahre mit dem Auto.", exampleRu: "РЇ РµРґСѓ РЅР° РјР°С€РёРЅРµ.", tip: "Perfekt СЃ sein: ich bin gefahren" },
  { word: "schlafen", level: "A1", category: "Р“Р»Р°РіРѕР»С‹", translation: "СЃРїР°С‚СЊ", gender: "вЂ”", plural: "вЂ”", example: "Ich schlafe 8 Stunden.", exampleRu: "РЇ СЃРїР»СЋ 8 С‡Р°СЃРѕРІ.", tip: "du schlГ¤fst вЂ” СѓРјР»Р°СѓС‚ РІ 2-Рј Р»РёС†Рµ" },
  { word: "helfen", level: "A1", category: "Р“Р»Р°РіРѕР»С‹", translation: "РїРѕРјРѕРіР°С‚СЊ", gender: "вЂ”", plural: "вЂ”", example: "Kannst du mir helfen?", exampleRu: "РўС‹ РјРѕР¶РµС€СЊ РјРЅРµ РїРѕРјРѕС‡СЊ?", tip: "helfen + Dativ: ich helfe DIR (РЅРµ dich!)" },
  { word: "brauchen", level: "A1", category: "Р“Р»Р°РіРѕР»С‹", translation: "РЅСѓР¶РґР°С‚СЊСЃСЏ / РЅСѓР¶РЅРѕ", gender: "вЂ”", plural: "вЂ”", example: "Ich brauche Hilfe.", exampleRu: "РњРЅРµ РЅСѓР¶РЅР° РїРѕРјРѕС‰СЊ.", tip: "Ich brauche = РјРЅРµ РЅСѓР¶РЅРѕ" },
  { word: "verstehen", level: "A1", category: "Р“Р»Р°РіРѕР»С‹", translation: "РїРѕРЅРёРјР°С‚СЊ", gender: "вЂ”", plural: "вЂ”", example: "Ich verstehe das nicht.", exampleRu: "РЇ СЌС‚РѕРіРѕ РЅРµ РїРѕРЅРёРјР°СЋ.", tip: "Perfekt: ich habe verstanden" },
  { word: "fragen", level: "A1", category: "Р“Р»Р°РіРѕР»С‹", translation: "СЃРїСЂР°С€РёРІР°С‚СЊ", gender: "вЂ”", plural: "вЂ”", example: "Darf ich fragen?", exampleRu: "РњРѕР¶РЅРѕ СЃРїСЂРѕСЃРёС‚СЊ?", tip: "fragen + Akkusativ: ich frage ihn" },
  { word: "antworten", level: "A1", category: "Р“Р»Р°РіРѕР»С‹", translation: "РѕС‚РІРµС‡Р°С‚СЊ", gender: "вЂ”", plural: "вЂ”", example: "Bitte antworte mir!", exampleRu: "РџРѕР¶Р°Р»СѓР№СЃС‚Р°, РѕС‚РІРµС‚СЊ РјРЅРµ!", tip: "antworten + Dativ: ich antworte DIR" },
  { word: "heiГџen", level: "A1", category: "Р“Р»Р°РіРѕР»С‹", translation: "РЅР°Р·С‹РІР°С‚СЊСЃСЏ / Р·РІР°С‚СЊ", gender: "вЂ”", plural: "вЂ”", example: "Wie heiГџt du?", exampleRu: "РљР°Рє С‚РµР±СЏ Р·РѕРІСѓС‚?", tip: "Ich heiГџe Anna. вЂ” РњРµРЅСЏ Р·РѕРІСѓС‚ РђРЅРЅР°." },

  // РџР РР›РђР“РђРўР•Р›Р¬РќР«Р•
  { word: "groГџ", level: "A1", category: "РџСЂРёР»Р°РіР°С‚РµР»СЊРЅС‹Рµ", translation: "Р±РѕР»СЊС€РѕР№ / РІС‹СЃРѕРєРёР№", gender: "вЂ”", plural: "вЂ”", example: "Das Haus ist sehr groГџ.", exampleRu: "Р”РѕРј РѕС‡РµРЅСЊ Р±РѕР»СЊС€РѕР№.", tip: "РўР°РєР¶Рµ Р·РЅР°С‡РёС‚ В«РІС‹СЃРѕРєРёР№В» Рѕ С‡РµР»РѕРІРµРєРµ" },
  { word: "klein", level: "A1", category: "РџСЂРёР»Р°РіР°С‚РµР»СЊРЅС‹Рµ", translation: "РјР°Р»РµРЅСЊРєРёР№", gender: "вЂ”", plural: "вЂ”", example: "Das Kind ist noch klein.", exampleRu: "Р РµР±С‘РЅРѕРє РµС‰С‘ РјР°Р»РµРЅСЊРєРёР№.", tip: "РђРЅС‚РѕРЅРёРј: groГџ" },
  { word: "gut", level: "A1", category: "РџСЂРёР»Р°РіР°С‚РµР»СЊРЅС‹Рµ", translation: "С…РѕСЂРѕС€РёР№ / С…РѕСЂРѕС€Рѕ", gender: "вЂ”", plural: "вЂ”", example: "Das Essen ist sehr gut.", exampleRu: "Р•РґР° РѕС‡РµРЅСЊ С…РѕСЂРѕС€Р°СЏ.", tip: "РЎСЂР°РІРЅ. СЃС‚.: besser вЂ” Р»СѓС‡С€Рµ, am besten вЂ” Р»СѓС‡С€РёР№" },
  { word: "neu", level: "A1", category: "РџСЂРёР»Р°РіР°С‚РµР»СЊРЅС‹Рµ", translation: "РЅРѕРІС‹Р№", gender: "вЂ”", plural: "вЂ”", example: "Ich habe ein neues Auto.", exampleRu: "РЈ РјРµРЅСЏ РЅРѕРІР°СЏ РјР°С€РёРЅР°.", tip: "Antonym: alt (СЃС‚Р°СЂС‹Р№)" },
  { word: "alt", level: "A1", category: "РџСЂРёР»Р°РіР°С‚РµР»СЊРЅС‹Рµ", translation: "СЃС‚Р°СЂС‹Р№ / РїРѕР¶РёР»РѕР№", gender: "вЂ”", plural: "вЂ”", example: "Das Buch ist sehr alt.", exampleRu: "РљРЅРёРіР° РѕС‡РµРЅСЊ СЃС‚Р°СЂР°СЏ.", tip: "Wie alt bist du? вЂ” РЎРєРѕР»СЊРєРѕ С‚РµР±Рµ Р»РµС‚?" },
  { word: "schГ¶n", level: "A1", category: "РџСЂРёР»Р°РіР°С‚РµР»СЊРЅС‹Рµ", translation: "РєСЂР°СЃРёРІС‹Р№ / С…РѕСЂРѕС€РёР№", gender: "вЂ”", plural: "вЂ”", example: "Das Wetter ist schГ¶n.", exampleRu: "РџРѕРіРѕРґР° С…РѕСЂРѕС€Р°СЏ.", tip: "SchГ¶nen Tag! вЂ” РҐРѕСЂРѕС€РµРіРѕ РґРЅСЏ!" },
  { word: "schnell", level: "A1", category: "РџСЂРёР»Р°РіР°С‚РµР»СЊРЅС‹Рµ", translation: "Р±С‹СЃС‚СЂС‹Р№ / Р±С‹СЃС‚СЂРѕ", gender: "вЂ”", plural: "вЂ”", example: "Das Auto fГ¤hrt schnell.", exampleRu: "РњР°С€РёРЅР° РµРґРµС‚ Р±С‹СЃС‚СЂРѕ.", tip: "РђРЅС‚РѕРЅРёРј: langsam (РјРµРґР»РµРЅРЅС‹Р№)" },
  { word: "billig", level: "A1", category: "РџСЂРёР»Р°РіР°С‚РµР»СЊРЅС‹Рµ", translation: "РґРµС€С‘РІС‹Р№", gender: "вЂ”", plural: "вЂ”", example: "Das ist sehr billig.", exampleRu: "Р­С‚Рѕ РѕС‡РµРЅСЊ РґС‘С€РµРІРѕ.", tip: "РђРЅС‚РѕРЅРёРј: teuer (РґРѕСЂРѕРіРѕР№)" },
  { word: "teuer", level: "A2", category: "РџСЂРёР»Р°РіР°С‚РµР»СЊРЅС‹Рµ", translation: "РґРѕСЂРѕРіРѕР№", gender: "вЂ”", plural: "вЂ”", example: "Das ist zu teuer!", exampleRu: "Р­С‚Рѕ СЃР»РёС€РєРѕРј РґРѕСЂРѕРіРѕ!", tip: "РђРЅС‚РѕРЅРёРј: billig (РґРµС€С‘РІС‹Р№)" },
  { word: "richtig", level: "A2", category: "РџСЂРёР»Р°РіР°С‚РµР»СЊРЅС‹Рµ", translation: "РїСЂР°РІРёР»СЊРЅС‹Р№ / РЅР°СЃС‚РѕСЏС‰РёР№", gender: "вЂ”", plural: "вЂ”", example: "Das ist richtig.", exampleRu: "Р­С‚Рѕ РїСЂР°РІРёР»СЊРЅРѕ.", tip: "РђРЅС‚РѕРЅРёРј: falsch (РЅРµРїСЂР°РІРёР»СЊРЅС‹Р№)" },
  { word: "wichtig", level: "A2", category: "РџСЂРёР»Р°РіР°С‚РµР»СЊРЅС‹Рµ", translation: "РІР°Р¶РЅС‹Р№", gender: "вЂ”", plural: "вЂ”", example: "Das ist sehr wichtig.", exampleRu: "Р­С‚Рѕ РѕС‡РµРЅСЊ РІР°Р¶РЅРѕ.", tip: "Wicht вЂ” РіРЅРѕРј, РІР°Р¶РЅР°СЏ РїРµСЂСЃРѕРЅР° (РёСЃС‚РѕСЂРёС‡РµСЃРєРё)" },

  // Р РђР—РќРћР•
  { word: "bitte", level: "A1", category: "Р Р°Р·РЅРѕРµ", translation: "РїРѕР¶Р°Р»СѓР№СЃС‚Р°", gender: "вЂ”", plural: "вЂ”", example: "Ein Kaffee, bitte!", exampleRu: "РљРѕС„Рµ, РїРѕР¶Р°Р»СѓР№СЃС‚Р°!", tip: "РўР°РєР¶Рµ Р·РЅР°С‡РёС‚ В«РїРѕР¶Р°Р»СѓР№СЃС‚Р°В» РІ РѕС‚РІРµС‚ РЅР° В«СЃРїР°СЃРёР±РѕВ»" },
  { word: "danke", level: "A1", category: "Р Р°Р·РЅРѕРµ", translation: "СЃРїР°СЃРёР±Рѕ", gender: "вЂ”", plural: "вЂ”", example: "Danke schГ¶n!", exampleRu: "Р‘РѕР»СЊС€РѕРµ СЃРїР°СЃРёР±Рѕ!", tip: "Danke schГ¶n / Danke sehr вЂ” СѓСЃРёР»РµРЅРЅРѕРµ В«СЃРїР°СЃРёР±РѕВ»" },
  { word: "ja", level: "A1", category: "Р Р°Р·РЅРѕРµ", translation: "РґР°", gender: "вЂ”", plural: "вЂ”", example: "Ja, ich verstehe.", exampleRu: "Р”Р°, СЏ РїРѕРЅРёРјР°СЋ.", tip: "Ja, genau! вЂ” Р”Р°, С‚РѕС‡РЅРѕ!" },
  { word: "nein", level: "A1", category: "Р Р°Р·РЅРѕРµ", translation: "РЅРµС‚", gender: "вЂ”", plural: "вЂ”", example: "Nein, das stimmt nicht.", exampleRu: "РќРµС‚, СЌС‚Рѕ РЅРµРІРµСЂРЅРѕ.", tip: "Nicht = РЅРµ (РґР»СЏ РіР»Р°РіРѕР»РѕРІ), kein = РЅРё РѕРґРЅРѕРіРѕ (РґР»СЏ СЃСѓС‰.)" },
  { word: "vielleicht", level: "A1", category: "Р Р°Р·РЅРѕРµ", translation: "РјРѕР¶РµС‚ Р±С‹С‚СЊ", gender: "вЂ”", plural: "вЂ”", example: "Vielleicht komme ich morgen.", exampleRu: "РњРѕР¶РµС‚, СЏ РїСЂРёРґСѓ Р·Р°РІС‚СЂР°.", tip: "viel + leicht = В«Р»РµРіРєРѕВ» в†’ РІРѕР·РјРѕР¶РЅРѕ" },
  { word: "natГјrlich", level: "A1", category: "Р Р°Р·РЅРѕРµ", translation: "РєРѕРЅРµС‡РЅРѕ", gender: "вЂ”", plural: "вЂ”", example: "NatГјrlich helfe ich dir!", exampleRu: "РљРѕРЅРµС‡РЅРѕ, СЏ С‚РµР±Рµ РїРѕРјРѕРіСѓ!", tip: "Р§Р°СЃС‚Рѕ РёСЃРїРѕР»СЊР·СѓСЋС‚ РІРјРµСЃС‚Рѕ В«jaВ» РґР»СЏ РІС‹СЂР°Р·РёС‚РµР»СЊРЅРѕСЃС‚Рё" },
  { word: "wirklich", level: "A2", category: "Р Р°Р·РЅРѕРµ", translation: "РґРµР№СЃС‚РІРёС‚РµР»СЊРЅРѕ / РїСЂР°РІРґР°", gender: "вЂ”", plural: "вЂ”", example: "Das ist wirklich schГ¶n.", exampleRu: "Р­С‚Рѕ РґРµР№СЃС‚РІРёС‚РµР»СЊРЅРѕ РєСЂР°СЃРёРІРѕ.", tip: "Wirklichkeit вЂ” СЂРµР°Р»СЊРЅРѕСЃС‚СЊ" },
  { word: "auch", level: "A1", category: "Р Р°Р·РЅРѕРµ", translation: "С‚РѕР¶Рµ / С‚Р°РєР¶Рµ", gender: "вЂ”", plural: "вЂ”", example: "Ich auch!", exampleRu: "РЇ С‚РѕР¶Рµ!", tip: "Ich auch = Me too вЂ” СЃР°РјРѕРµ С‡Р°СЃС‚РѕРµ РІС‹СЂР°Р¶РµРЅРёРµ" },
  { word: "noch", level: "A1", category: "Р Р°Р·РЅРѕРµ", translation: "РµС‰С‘", gender: "вЂ”", plural: "вЂ”", example: "Ich bin noch mГјde.", exampleRu: "РЇ РµС‰С‘ СѓСЃС‚Р°Р».", tip: "noch nicht = РµС‰С‘ РЅРµ; noch kein = РµС‰С‘ РЅРё РѕРґРЅРѕРіРѕ" },
  { word: "schon", level: "A1", category: "Р Р°Р·РЅРѕРµ", translation: "СѓР¶Рµ", gender: "вЂ”", plural: "вЂ”", example: "Ich bin schon fertig.", exampleRu: "РЇ СѓР¶Рµ РіРѕС‚РѕРІ.", tip: "РќРµ РїСѓС‚Р°Р№: schon (СѓР¶Рµ) Рё schГ¶n (РєСЂР°СЃРёРІС‹Р№)" },
];

const GENDER_COLOR = { der: "#3b82f6", die: "#ec4899", das: "#10b981", "вЂ”": "rgba(255,255,255,0.3)" };

function WordsScreen({ onBack, langLevel }) {
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("Р’СЃРµ");
  const [filterLevel, setFilterLevel] = useState(langLevel || "A1");
  const [selected, setSelected] = useState(null);

  const filtered = DICTIONARY.filter(w =>
    (filterLevel === "Р’СЃРµ" || w.level === filterLevel) &&
    (filterCat === "Р’СЃРµ" || w.category === filterCat) &&
    (search === "" || w.word.toLowerCase().includes(search.toLowerCase()) || w.translation.toLowerCase().includes(search.toLowerCase()))
  );

  if (selected) {
    const w = selected;
    const gColor = GENDER_COLOR[w.gender] || GENDER_COLOR["вЂ”"];
    return (
      <div style={{ paddingTop: 40 }}>
        <button onClick={() => setSelected(null)} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", fontSize: 13, cursor: "pointer", marginBottom: 24, padding: 0 }}>
          в†ђ РЎР»РѕРІР°СЂСЊ
        </button>

        <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 24, padding: "28px 24px", marginBottom: 16 }}>
          <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
            <span style={{ fontSize: 11, background: `${gColor}20`, color: gColor, padding: "4px 10px", borderRadius: 20, fontWeight: 700 }}>{w.gender !== "вЂ”" ? w.gender : ""}</span>
            <span style={{ fontSize: 11, background: "rgba(124,92,252,0.15)", color: "#7C5CFC", padding: "4px 10px", borderRadius: 20, fontWeight: 600 }}>{w.level}</span>
            <span style={{ fontSize: 11, background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.4)", padding: "4px 10px", borderRadius: 20 }}>{w.category}</span>
          </div>
          <div style={{ fontSize: 34, fontWeight: 900, color: "#fff", marginBottom: 8 }}>{w.word}</div>
          <div style={{ fontSize: 18, color: "rgba(255,255,255,0.6)", marginBottom: 20 }}>{w.translation}</div>
          {w.plural && w.plural !== "вЂ”" && (
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", marginBottom: 4 }}>РњРЅ.С‡.: <span style={{ color: "rgba(255,255,255,0.6)" }}>{w.plural}</span></div>
          )}
        </div>

        <div style={{ background: "rgba(124,92,252,0.08)", border: "1px solid rgba(124,92,252,0.2)", borderRadius: 16, padding: "18px 20px", marginBottom: 12 }}>
          <div style={{ fontSize: 11, color: "#7C5CFC", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", marginBottom: 10 }}>РџСЂРёРјРµСЂ</div>
          <div style={{ fontSize: 16, color: "#fff", fontWeight: 600, marginBottom: 6 }}>{w.example}</div>
          <div style={{ fontSize: 14, color: "rgba(255,255,255,0.45)" }}>{w.exampleRu}</div>
        </div>

        <div style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: 16, padding: "16px 20px" }}>
          <div style={{ fontSize: 11, color: "#f59e0b", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>рџ’Ў РџРѕРґСЃРєР°Р·РєР°</div>
          <div style={{ fontSize: 14, color: "rgba(255,255,255,0.7)", lineHeight: 1.6 }}>{w.tip}</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ paddingTop: 40 }}>
      <button onClick={onBack} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", fontSize: 13, cursor: "pointer", marginBottom: 20, padding: 0 }}>
        в†ђ РќР°Р·Р°Рґ
      </button>
      <h1 style={{ fontSize: 26, fontWeight: 800, color: "#fff", margin: "0 0 4px" }}>РЎР»РѕРІР°СЂСЊ</h1>
      <div style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", marginBottom: 20 }}>{filtered.length} СЃР»РѕРІ В· Goethe Institut</div>

      <input value={search} onChange={e => setSearch(e.target.value)} placeholder="РџРѕРёСЃРє СЃР»РѕРІР°..." style={{ width: "100%", padding: "12px 16px", borderRadius: 12, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", fontSize: 15, outline: "none", boxSizing: "border-box", marginBottom: 14 }} />

      <div style={{ display: "flex", gap: 8, marginBottom: 14, overflowX: "auto", paddingBottom: 4 }}>
        {["A1", "A2", "Р’СЃРµ"].map(l => (
          <button key={l} onClick={() => setFilterLevel(l)} style={{ flexShrink: 0, padding: "6px 14px", borderRadius: 20, border: "none", background: filterLevel === l ? "#7C5CFC" : "rgba(255,255,255,0.07)", color: filterLevel === l ? "#fff" : "rgba(255,255,255,0.45)", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>{l}</button>
        ))}
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 20, overflowX: "auto", paddingBottom: 4 }}>
        {["Р’СЃРµ", ...WORD_CATEGORIES].map(c => (
          <button key={c} onClick={() => setFilterCat(c)} style={{ flexShrink: 0, padding: "6px 14px", borderRadius: 20, border: "none", background: filterCat === c ? "rgba(124,92,252,0.3)" : "rgba(255,255,255,0.05)", color: filterCat === c ? "#fff" : "rgba(255,255,255,0.4)", fontSize: 12, cursor: "pointer" }}>{c}</button>
        ))}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {filtered.map((w, i) => {
          const gColor = GENDER_COLOR[w.gender] || GENDER_COLOR["вЂ”"];
          return (
            <button key={i} onClick={() => setSelected(w)} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: "14px 16px", textAlign: "left", cursor: "pointer", display: "flex", alignItems: "center", gap: 12 }}>
              {w.gender !== "вЂ”" && (
                <div style={{ width: 36, height: 36, borderRadius: 10, background: `${gColor}20`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: gColor, flexShrink: 0 }}>
                  {w.gender}
                </div>
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>{w.word}</div>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>{w.translation}</div>
              </div>
              <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 16 }}>в†’</span>
            </button>
          );
        })}
        {filtered.length === 0 && (
          <div style={{ textAlign: "center", color: "rgba(255,255,255,0.25)", padding: "40px 0", fontSize: 14 }}>РќРёС‡РµРіРѕ РЅРµ РЅР°Р№РґРµРЅРѕ</div>
        )}
      </div>
    </div>
  );
}

// в”Ђв”Ђ РўР•РћР РРЇ в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ
const LESSONS = [
  {
    id: "articles",
    title: "РђСЂС‚РёРєР»Рё",
    icon: "рџ“Њ",
    color: "#7C5CFC",
    cards: [
      {
        title: "РўСЂРё СЂРѕРґР° РІ РЅРµРјРµС†РєРѕРј",
        body: "РљР°Р¶РґРѕРµ СЃСѓС‰РµСЃС‚РІРёС‚РµР»СЊРЅРѕРµ РёРјРµРµС‚ СЂРѕРґ:\n\nрџ”µ der вЂ” РјСѓР¶СЃРєРѕР№\nрџ”ґ die вЂ” Р¶РµРЅСЃРєРёР№\nрџџў das вЂ” СЃСЂРµРґРЅРёР№\n\nР РѕРґ РЅСѓР¶РЅРѕ Р·Р°РїРѕРјРёРЅР°С‚СЊ РІРјРµСЃС‚Рµ СЃРѕ СЃР»РѕРІРѕРј.",
      },
      {
        title: "РРјРµРЅРёС‚РµР»СЊРЅС‹Р№ РїР°РґРµР¶ (Nominativ)",
        body: "РљС‚Рѕ? Р§С‚Рѕ? вЂ” РїРѕРґР»РµР¶Р°С‰РµРµ.\n\nрџ”µ der Hund\nрџ”ґ die Katze\nрџџў das Kind\n\nРџСЂРёРјРµСЂ:\nв†’ Der Hund schlГ¤ft.\nв†’ Die Katze trinkt Milch.",
      },
      {
        title: "Р’РёРЅРёС‚РµР»СЊРЅС‹Р№ РїР°РґРµР¶ (Akkusativ)",
        body: "РљРѕРіРѕ? Р§С‚Рѕ? вЂ” РїСЂСЏРјРѕРµ РґРѕРїРѕР»РЅРµРЅРёРµ.\n\nрџ”µ den Hund в†ђ РјРµРЅСЏРµС‚СЃСЏ!\nрџ”ґ die Katze\nрџџў das Kind\n\nРџСЂРёРјРµСЂ:\nв†’ Ich sehe den Hund.\nв†’ Er kauft die Katze.",
      },
      {
        title: "Р”Р°С‚РµР»СЊРЅС‹Р№ РїР°РґРµР¶ (Dativ)",
        body: "РљРѕРјСѓ? Р§РµРјСѓ? вЂ” РєРѕСЃРІРµРЅРЅРѕРµ РґРѕРїРѕР»РЅРµРЅРёРµ.\n\nрџ”µ dem Hund\nрџ”ґ der Katze в†ђ РјРµРЅСЏРµС‚СЃСЏ!\nрџџў dem Kind\n\nРџСЂРёРјРµСЂ:\nв†’ Ich helfe dem Mann.\nв†’ Sie gibt der Frau Blumen.",
      },
      {
        title: "РўР°Р±Р»РёС†Р° Р°СЂС‚РёРєР»РµР№",
        type: "table",
        hint: "рџ’Ў Р’ Akkusativ РјРµРЅСЏРµС‚СЃСЏ С‚РѕР»СЊРєРѕ РјСѓР¶СЃРєРѕР№ СЂРѕРґ: der в†’ den",
        headers: ["", "РјСѓР¶СЃРєРѕР№", "Р¶РµРЅСЃРєРёР№", "СЃСЂРµРґРЅРёР№"],
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
    title: "Р“Р»Р°РіРѕР»С‹",
    icon: "вљЎ",
    color: "#10b981",
    cards: [
      {
        title: "РЎРїСЂСЏР¶РµРЅРёРµ: sein (Р±С‹С‚СЊ)",
        body: "ich bin       вЂ” СЏ РµСЃС‚СЊ\ndu bist       вЂ” С‚С‹ РµСЃС‚СЊ\ner/sie ist    вЂ” РѕРЅ/РѕРЅР° РµСЃС‚СЊ\nwir sind      вЂ” РјС‹ РµСЃС‚СЊ\nihr seid      вЂ” РІС‹ РµСЃС‚СЊ\nsie/Sie sind  вЂ” РѕРЅРё/Р’С‹ РµСЃС‚СЊ\n\nРџСЂРёРјРµСЂ:\nв†’ Ich bin Student.\nв†’ Wir sind hier.",
        mono: true,
      },
      {
        title: "РЎРїСЂСЏР¶РµРЅРёРµ: haben (РёРјРµС‚СЊ)",
        body: "ich habe      вЂ” СЏ РёРјРµСЋ\ndu hast       вЂ” С‚С‹ РёРјРµРµС€СЊ\ner/sie hat    вЂ” РѕРЅ/РѕРЅР° РёРјРµРµС‚\nwir haben     вЂ” РјС‹ РёРјРµРµРј\nihr habt      вЂ” РІС‹ РёРјРµРµС‚Рµ\nsie/Sie haben вЂ” РѕРЅРё/Р’С‹ РёРјРµСЋС‚\n\nРџСЂРёРјРµСЂ:\nв†’ Ich habe ein Auto.\nв†’ Er hat Hunger.",
        mono: true,
      },
      {
        title: "Р РµРіСѓР»СЏСЂРЅС‹Рµ РіР»Р°РіРѕР»С‹ (-en)",
        body: "РћСЃРЅРѕРІР° + РѕРєРѕРЅС‡Р°РЅРёРµ:\n\nwohnen (Р¶РёС‚СЊ)\nich wohn-e\ndu wohn-st\ner/sie wohn-t\nwir wohn-en\nihr wohn-t\nsie wohn-en\n\nрџ’Ў Р‘РѕР»СЊС€РёРЅСЃС‚РІРѕ РіР»Р°РіРѕР»РѕРІ СЃРїСЂСЏРіР°СЋС‚СЃСЏ РїРѕ СЌС‚РѕР№ СЃС…РµРјРµ.",
        mono: true,
      },
      {
        title: "РџРµСЂС„РµРєС‚: haben РёР»Рё sein?",
        body: "РџСЂРѕС€РµРґС€РµРµ РІСЂРµРјСЏ = haben/sein + Partizip II\n\nвњ… haben вЂ” Р±РѕР»СЊС€РёРЅСЃС‚РІРѕ РіР»Р°РіРѕР»РѕРІ:\nв†’ Ich habe gegessen.\nв†’ Er hat geschlafen.\n\nвњ… sein вЂ” РґРІРёР¶РµРЅРёРµ Рё РёР·РјРµРЅРµРЅРёРµ СЃРѕСЃС‚РѕСЏРЅРёСЏ:\nв†’ Ich bin gegangen.\nв†’ Sie ist aufgestanden.\n\nрџ’Ў gehen, kommen, fahren, fliegen в†’ sein",
      },
      {
        title: "РњРѕРґР°Р»СЊРЅС‹Рµ РіР»Р°РіРѕР»С‹",
        body: "kГ¶nnen  вЂ” РјРѕС‡СЊ (СѓРјРµСЋ)\nmГјssen  вЂ” РґРѕР»Р¶РµРЅ\nwollen  вЂ” С…РѕС‚РµС‚СЊ\nsollen  вЂ” РґРѕР»Р¶РµРЅ (РїРѕ С‡СЊРµР№-С‚Рѕ РІРѕР»Рµ)\ndГјrfen  вЂ” РјРѕР¶РЅРѕ (СЂР°Р·СЂРµС€РµРЅРѕ)\nmГ¶chten вЂ” С…РѕС‚РµР» Р±С‹\n\nРЎС‚СЂСѓРєС‚СѓСЂР°:\nв†’ Ich kann Deutsch sprechen.\nв†’ Er muss arbeiten.\nрџ’Ў Р’С‚РѕСЂРѕР№ РіР»Р°РіРѕР» вЂ” РёРЅС„РёРЅРёС‚РёРІ РІ РєРѕРЅС†Рµ.",
      },
    ],
  },
  {
    id: "wordorder",
    title: "РџРѕСЂСЏРґРѕРє СЃР»РѕРІ",
    icon: "рџ”¤",
    color: "#f59e0b",
    cards: [
      {
        title: "Р“Р»Р°РіРѕР» РІСЃРµРіРґР° РЅР° 2-Рј РјРµСЃС‚Рµ",
        body: "Р’ РЅРµРјРµС†РєРѕРј РіР»Р°РіРѕР» Р·Р°РЅРёРјР°РµС‚ РЎРўР РћР“Рћ 2-СЋ РїРѕР·РёС†РёСЋ.\n\nв†’ Ich gehe heute ins Kino.\nв†’ Heute gehe ich ins Kino.\nв†’ Ins Kino gehe ich heute.\n\nрџ’Ў Р§С‚Рѕ Р±С‹ РЅРё СЃС‚РѕСЏР»Рѕ РїРµСЂРІС‹Рј вЂ” РіР»Р°РіРѕР» РІСЃРµРіРґР° РІС‚РѕСЂРѕР№.",
      },
      {
        title: "РћС‚СЂРёС†Р°РЅРёРµ: nicht Рё kein",
        body: "kein вЂ” РѕС‚СЂРёС†Р°РµС‚ СЃСѓС‰РµСЃС‚РІРёС‚РµР»СЊРЅРѕРµ:\nв†’ Ich habe kein Auto.\nв†’ Das ist kein Problem.\n\nnicht вЂ” РѕС‚СЂРёС†Р°РµС‚ РІСЃС‘ РѕСЃС‚Р°Р»СЊРЅРѕРµ:\nв†’ Ich gehe nicht.\nв†’ Er schlГ¤ft nicht gut.\n\nрџ’Ў kein = k + ein (РєР°Рє Р°СЂС‚РёРєР»СЊ)",
      },
      {
        title: "Р’РѕРїСЂРѕСЃРёС‚РµР»СЊРЅС‹Рµ СЃР»РѕРІР°",
        body: "Wer?    вЂ” РљС‚Рѕ?\nWas?    вЂ” Р§С‚Рѕ?\nWo?     вЂ” Р“РґРµ?\nWann?   вЂ” РљРѕРіРґР°?\nWie?    вЂ” РљР°Рє?\nWarum?  вЂ” РџРѕС‡РµРјСѓ?\nWohin?  вЂ” РљСѓРґР°?\nWoher?  вЂ” РћС‚РєСѓРґР°?\n\nв†’ Wo wohnst du?\nв†’ Wann kommst du?",
        mono: true,
      },
      {
        title: "РџСЂРёРґР°С‚РѕС‡РЅС‹Рµ РїСЂРµРґР»РѕР¶РµРЅРёСЏ",
        body: "Р’ РїСЂРёРґР°С‚РѕС‡РЅРѕРј РіР»Р°РіРѕР» СѓС…РѕРґРёС‚ Р’ РљРћРќР•Р¦.\n\nР“Р»Р°РІРЅРѕРµ: Ich weiГџ.\nРџСЂРёРґР°С‚РѕС‡РЅРѕРµ: dass er kommt.\nв†’ Ich weiГџ, dass er kommt.\n\nР”СЂСѓРіРёРµ СЃРѕСЋР·С‹:\nweil (РїРѕС‚РѕРјСѓ С‡С‚Рѕ)\nobwohl (С…РѕС‚СЏ)\nwenn (РµСЃР»Рё/РєРѕРіРґР°)\nв†’ Er lernt, weil er klug ist.",
      },
    ],
  },
  {
    id: "vocab",
    title: "Р›РµРєСЃРёРєР°",
    icon: "рџ’Ў",
    color: "#ec4899",
    cards: [
      {
        title: "РЎР»РѕР¶РЅС‹Рµ СЃР»РѕРІР° (Komposita)",
        body: "РќРµРјРµС†РєРёР№ СЃРѕР·РґР°С‘С‚ РЅРѕРІС‹Рµ СЃР»РѕРІР° СЃРѕРµРґРёРЅСЏСЏ СЃС‚Р°СЂС‹Рµ:\n\ndie Hand + das Tuch = das Handtuch (РїРѕР»РѕС‚РµРЅС†Рµ)\ndie Wasser + die Flasche = die Wasserflasche (Р±СѓС‚С‹Р»РєР° РІРѕРґС‹)\nder Zahn + die BГјrste = die ZahnbГјrste (Р·СѓР±РЅР°СЏ С‰С‘С‚РєР°)\n\nрџ’Ў Р РѕРґ РѕРїСЂРµРґРµР»СЏРµС‚СЃСЏ РїРѕСЃР»РµРґРЅРёРј СЃР»РѕРІРѕРј!",
      },
      {
        title: "Р§РёСЃР»Р° 1вЂ“20",
        body: "1 eins    11 elf\n2 zwei    12 zwГ¶lf\n3 drei    13 dreizehn\n4 vier    14 vierzehn\n5 fГјnf    15 fГјnfzehn\n6 sechs   16 sechzehn\n7 sieben  17 siebzehn\n8 acht    18 achtzehn\n9 neun    19 neunzehn\n10 zehn   20 zwanzig",
        mono: true,
      },
      {
        title: "Р”РЅРё РЅРµРґРµР»Рё",
        body: "Montag     вЂ” РџРѕРЅРµРґРµР»СЊРЅРёРє\nDienstag   вЂ” Р’С‚РѕСЂРЅРёРє\nMittwoch   вЂ” РЎСЂРµРґР°\nDonnerstag вЂ” Р§РµС‚РІРµСЂРі\nFreitag    вЂ” РџСЏС‚РЅРёС†Р°\nSamstag    вЂ” РЎСѓР±Р±РѕС‚Р°\nSonntag    вЂ” Р’РѕСЃРєСЂРµСЃРµРЅСЊРµ\n\nрџ’Ў Р’СЃРµ РјСѓР¶СЃРєРѕРіРѕ СЂРѕРґР°: der Montag",
        mono: true,
      },
      {
        title: "РџРѕР»РµР·РЅС‹Рµ С„СЂР°Р·С‹",
        body: "Wie bitte?         вЂ” РџСЂРѕСЃС‚РёС‚Рµ?\nIch verstehe nicht. вЂ” РЇ РЅРµ РїРѕРЅРёРјР°СЋ.\nKГ¶nnen Sie langsamer sprechen? вЂ” Р“РѕРІРѕСЂРёС‚Рµ РјРµРґР»РµРЅРЅРµРµ?\nWas bedeutet...?   вЂ” Р§С‚Рѕ Р·РЅР°С‡РёС‚...?\nIch lerne Deutsch.  вЂ” РЇ СѓС‡Сѓ РЅРµРјРµС†РєРёР№.\nMein Deutsch ist nicht so gut. вЂ” РњРѕР№ РЅРµРјРµС†РєРёР№ РЅРµ РѕС‡РµРЅСЊ.",
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
          в†ђ {lesson.title}
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
            в†ђ РќР°Р·Р°Рґ
          </button>
          {isLast ? (
            <button onClick={() => { setTopic(null); setCardIdx(0); }} style={{ flex: 2, background: lesson.color, border: "none", borderRadius: 14, padding: "14px", color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer" }}>
              Р“РѕС‚РѕРІРѕ вњ“
            </button>
          ) : (
            <button onClick={() => setCardIdx(i => i + 1)} style={{ flex: 2, background: lesson.color, border: "none", borderRadius: 14, padding: "14px", color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer" }}>
              Р”Р°Р»РµРµ в†’
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={{ paddingTop: 60 }}>
      <button onClick={onBack} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", fontSize: 13, cursor: "pointer", marginBottom: 24, padding: 0 }}>
        в†ђ РќР°Р·Р°Рґ
      </button>
      <div style={{ fontSize: 11, letterSpacing: 3, color: "#7C5CFC", fontWeight: 600, marginBottom: 12, textTransform: "uppercase" }}>DuoPar В· РўРµРѕСЂРёСЏ</div>
      <h1 style={{ fontSize: 28, fontWeight: 800, color: "#fff", margin: "0 0 6px" }}>РЈС‡РёС‚СЊ</h1>
      <div style={{ fontSize: 14, color: "rgba(255,255,255,0.35)", marginBottom: 28 }}>РљР°СЂС‚РѕС‡РєРё СЃ РїСЂР°РІРёР»Р°РјРё РЅРµРјРµС†РєРѕРіРѕ</div>

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
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}>{lesson.cards.length} РєР°СЂС‚РѕС‡РµРє</div>
              </div>
              <span style={{ marginLeft: "auto", color: lesson.color, fontSize: 18 }}>в†’</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// в”Ђв”Ђ LEVEL PICKER в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ
function LevelPicker({ onPick, onTest }) {
  const levels = [
    { id: "A0", icon: "рџЊ±", title: "A0 В· РќР°С‡РёРЅР°СЋС‰РёР№", desc: "РќРёРєРѕРіРґР° РЅРµ СѓС‡РёР» РЅРµРјРµС†РєРёР№" },
    { id: "A1", icon: "рџ“–", title: "A1 В· Р­Р»РµРјРµРЅС‚Р°СЂРЅС‹Р№", desc: "Р—РЅР°СЋ Р±Р°Р·РѕРІС‹Рµ СЃР»РѕРІР° Рё С„СЂР°Р·С‹" },
    { id: "A2", icon: "рџ’¬", title: "A2 В· Р‘Р°Р·РѕРІС‹Р№", desc: "РџРѕРЅРёРјР°СЋ РїСЂРѕСЃС‚С‹Рµ РїСЂРµРґР»РѕР¶РµРЅРёСЏ" },
  ];
  return (
    <div style={{ paddingTop: 60 }}>
      <div style={{ fontSize: 11, letterSpacing: 3, color: "#7C5CFC", fontWeight: 600, marginBottom: 12, textTransform: "uppercase" }}>DuoPar В· Deutsch</div>
      <h1 style={{ fontSize: 26, fontWeight: 800, color: "#fff", margin: "0 0 6px" }}>РљР°РєРѕР№ Сѓ С‚РµР±СЏ СѓСЂРѕРІРµРЅСЊ?</h1>
      <div style={{ fontSize: 14, color: "rgba(255,255,255,0.35)", marginBottom: 28 }}>Р’С‹Р±РµСЂРё СЃР°Рј РёР»Рё РїСЂРѕР№РґРё С‚РµСЃС‚</div>

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
            <span style={{ marginLeft: "auto", color: "rgba(255,255,255,0.25)", fontSize: 18 }}>в†’</span>
          </button>
        ))}
      </div>

      <button onClick={onTest} style={{
        width: "100%", background: "transparent", border: "1.5px dashed rgba(255,255,255,0.15)",
        borderRadius: 16, padding: "16px", cursor: "pointer", color: "rgba(255,255,255,0.45)",
        fontSize: 14, fontWeight: 500,
      }}>
        рџ¤” РќРµ Р·РЅР°СЋ СЃРІРѕР№ СѓСЂРѕРІРµРЅСЊ вЂ” РїСЂРѕР№С‚Рё С‚РµСЃС‚
      </button>
    </div>
  );
}

// в”Ђв”Ђ PLACEMENT TEST в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ
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
        if (isLast) {
          onDone(LEVEL_FROM_SCORE(newScore), newScore);
        } else {
          setQIndex(idx => idx + 1);
          setSelected(null);
          setRevealed(false);
        }
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
      <div style={{ fontSize: 11, letterSpacing: 3, color: "#7C5CFC", fontWeight: 600, marginBottom: 12, textTransform: "uppercase" }}>DuoPar В· РўРµСЃС‚ СѓСЂРѕРІРЅСЏ</div>
      <h1 style={{ fontSize: 26, fontWeight: 800, color: "#fff", margin: "0 0 6px" }}>РћРїСЂРµРґРµР»РёРј С‚РІРѕР№ СѓСЂРѕРІРµРЅСЊ</h1>
      <div style={{ fontSize: 14, color: "rgba(255,255,255,0.35)", marginBottom: 28 }}>10 РІРѕРїСЂРѕСЃРѕРІ В· Р·Р°Р№РјС‘С‚ ~2 РјРёРЅСѓС‚С‹</div>

      <div style={{ display: "flex", gap: 6, marginBottom: 28 }}>
        {PLACEMENT_TEST.map((_, i) => (
          <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: i < qIndex ? "#7C5CFC" : i === qIndex ? "rgba(124,92,252,0.5)" : "rgba(255,255,255,0.12)" }} />
        ))}
      </div>

      <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", marginBottom: 12 }}>Р’РѕРїСЂРѕСЃ {qIndex + 1} РёР· {PLACEMENT_TEST.length}</div>
      <div style={{ fontSize: 20, fontWeight: 700, color: "#fff", marginBottom: 24, lineHeight: 1.4 }}>{q.prompt}</div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {q.options.map((opt, i) => (
          <button key={i} onClick={() => answer(i)} style={optStyle(i)}>
            <span style={{ marginRight: 10, opacity: 0.4, fontSize: 13 }}>{["A", "B", "C", "D"][i]}</span>
            {opt}
            {revealed && i === q.correct && <span style={{ float: "right" }}>вњ“</span>}
            {revealed && i === selected && selected !== q.correct && <span style={{ float: "right" }}>вњ—</span>}
          </button>
        ))}
      </div>
    </div>
  );
}

// в”Ђв”Ђ PLACEMENT RESULT в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ
function PlacementResult({ level, score, onStart }) {
  const info = LEVEL_INFO[level];
  return (
    <div style={{ paddingTop: 60, textAlign: "center" }}>
      <div style={{ fontSize: 64, marginBottom: 16 }}>рџЋЇ</div>
      <div style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", marginBottom: 8 }}>РўС‹ РѕС‚РІРµС‚РёР» РїСЂР°РІРёР»СЊРЅРѕ РЅР° {score} РёР· 10</div>
      <div style={{ fontSize: 28, fontWeight: 800, color: "#fff", marginBottom: 24 }}>РўРІРѕР№ СѓСЂРѕРІРµРЅСЊ</div>
      <div style={{
        background: `rgba(${level === "A0" ? "16,185,129" : level === "A1" ? "124,92,252" : "245,158,11"},0.15)`,
        border: `1px solid ${info.color}40`,
        borderRadius: 20, padding: "28px 32px", marginBottom: 32, display: "inline-block",
      }}>
        <div style={{ fontSize: 48, fontWeight: 900, color: info.color, marginBottom: 4 }}>{level}</div>
        <div style={{ fontSize: 16, fontWeight: 600, color: "#fff" }}>{info.label.split("В·")[1].trim()}</div>
        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>{info.desc}</div>
      </div>
      <button onClick={onStart} style={{ width: "100%", background: "#7C5CFC", color: "#fff", border: "none", borderRadius: 16, padding: "18px", fontSize: 16, fontWeight: 700, cursor: "pointer" }}>
        РќР°С‡Р°С‚СЊ СѓС‡РёС‚СЊ в†’
      </button>
    </div>
  );
}

// в”Ђв”Ђ AUTH SCREEN в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ
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
      <div style={{ fontSize: 48, marginBottom: 16 }}>рџ“¬</div>
      <div style={{ fontSize: 22, fontWeight: 700, color: "#fff", marginBottom: 8 }}>РџСЂРѕРІРµСЂСЊ РїРѕС‡С‚Сѓ</div>
      <div style={{ fontSize: 14, color: "rgba(255,255,255,0.4)" }}>РћС‚РїСЂР°РІРёР»Рё РїРёСЃСЊРјРѕ СЃ РїРѕРґС‚РІРµСЂР¶РґРµРЅРёРµРј РЅР° {email}</div>
    </div>
  );

  return (
    <div style={{ paddingTop: 60 }}>
      <div style={{ fontSize: 11, letterSpacing: 3, color: "#7C5CFC", fontWeight: 600, marginBottom: 12, textTransform: "uppercase" }}>DuoPar В· Deutsch</div>
      <h1 style={{ fontSize: 28, fontWeight: 800, color: "#fff", margin: "0 0 32px" }}>
        {mode === "login" ? "Р”РѕР±СЂРѕ РїРѕР¶Р°Р»РѕРІР°С‚СЊ" : "РЎРѕР·РґР°С‚СЊ Р°РєРєР°СѓРЅС‚"}
      </h1>
      <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {mode === "register" && <input style={inp} placeholder="РќРёРєРЅРµР№Рј (РЅРµРѕР±СЏР·Р°С‚РµР»СЊРЅРѕ)" value={username} onChange={e => setUsername(e.target.value)} />}
        <input style={inp} type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
        <input style={inp} type="password" placeholder="РџР°СЂРѕР»СЊ" value={password} onChange={e => setPassword(e.target.value)} required />
        {error && <div style={{ fontSize: 13, color: "#ef4444", padding: "8px 12px", background: "rgba(239,68,68,0.1)", borderRadius: 8 }}>{error}</div>}
        <button type="submit" disabled={loading} style={{ background: "#7C5CFC", color: "#fff", border: "none", borderRadius: 14, padding: "16px", fontSize: 16, fontWeight: 700, cursor: "pointer", marginTop: 4, opacity: loading ? 0.6 : 1 }}>
          {loading ? "..." : mode === "login" ? "Р’РѕР№С‚Рё" : "Р—Р°СЂРµРіРёСЃС‚СЂРёСЂРѕРІР°С‚СЊСЃСЏ"}
        </button>
      </form>
      <div style={{ textAlign: "center", marginTop: 20 }}>
        <button onClick={() => { setMode(m => m === "login" ? "register" : "login"); setError(""); }} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", fontSize: 14, cursor: "pointer", textDecoration: "underline" }}>
          {mode === "login" ? "РќРµС‚ Р°РєРєР°СѓРЅС‚Р°? Р—Р°СЂРµРіРёСЃС‚СЂРёСЂРѕРІР°С‚СЊСЃСЏ" : "РЈР¶Рµ РµСЃС‚СЊ Р°РєРєР°СѓРЅС‚? Р’РѕР№С‚Рё"}
        </button>
      </div>
    </div>
  );
}

// в”Ђв”Ђ XP BAR в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ
function XPBar({ xp, username, langLevel }) {
  const level = getLevel(xp);
  const progress = (xp % 200) / 200;
  const info = langLevel ? LEVEL_INFO[langLevel] : null;
  return (
    <div style={{ flex: 1 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        <span style={{ fontSize: 13, color: "#fff", fontWeight: 600 }}>
          {username || "РРіСЂРѕРє"} В· <span style={{ color: "#7C5CFC" }}>РЈСЂ. {level}</span>
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

// в”Ђв”Ђ PROGRESS BAR в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ
function ProgressBar({ current, total }) {
  return (
    <div style={{ display: "flex", gap: 6, marginBottom: 24 }}>
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: i < current ? "#7C5CFC" : "rgba(255,255,255,0.12)", transition: "background 0.3s" }} />
      ))}
    </div>
  );
}

// в”Ђв”Ђ PARTNER BUBBLE в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ
function PartnerBubble({ answered, isCorrect }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 14, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", fontSize: 13, color: "rgba(255,255,255,0.6)" }}>
      <span style={{ fontSize: 20 }}>{PARTNER.avatar}</span>
      <div>
        <div style={{ fontWeight: 600, color: "rgba(255,255,255,0.85)", fontSize: 12 }}>{PARTNER.name} В· {PARTNER.level}</div>
        <div>{answered === null ? "РґСѓРјР°РµС‚..." : isCorrect ? "вњ“ С‚РѕР¶Рµ РїСЂР°РІРёР»СЊРЅРѕ!" : "вњ— РѕС€РёР±Р»Р°СЃСЊ"}</div>
      </div>
      <div style={{ marginLeft: "auto", width: 8, height: 8, borderRadius: "50%", background: answered === null ? "#f59e0b" : isCorrect ? "#10b981" : "#ef4444", boxShadow: `0 0 6px ${answered === null ? "#f59e0b" : isCorrect ? "#10b981" : "#ef4444"}` }} />
    </div>
  );
}

// в”Ђв”Ђ SETUP SCREEN в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ
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
      <button onClick={onBack} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", fontSize: 13, cursor: "pointer", marginBottom: 20, padding: 0 }}>в†ђ РќР°Р·Р°Рґ</button>
      <div style={{ fontSize: 11, letterSpacing: 3, color: "#7C5CFC", fontWeight: 600, marginBottom: 12, textTransform: "uppercase" }}>DuoPar В· {langLevel}</div>
      <h1 style={{ fontSize: 28, fontWeight: 800, color: "#fff", margin: "0 0 20px" }}>РќРѕРІР°СЏ РёРіСЂР°</h1>

      <div style={{ background: "rgba(16,185,129,0.07)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: 16, padding: "14px 16px", marginBottom: 24, display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 40, height: 40, borderRadius: 12, fontSize: 20, background: "rgba(124,92,252,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>{PARTNER.avatar}</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, color: "#fff", fontSize: 14 }}>{PARTNER.name} В· РїР°СЂС‚РЅС‘СЂ РЅР°Р№РґРµРЅ</div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}>РЈСЂРѕРІРµРЅСЊ {PARTNER.level} В· РѕРЅР»Р°Р№РЅ СЃРµР№С‡Р°СЃ</div>
        </div>
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#10b981", boxShadow: "0 0 6px #10b981" }} />
      </div>

      <div style={{ fontSize: 14, color: "rgba(255,255,255,0.35)", marginBottom: 16 }}>Р’С‹Р±РµСЂРё С‚РµРјС‹ РґР»СЏ СѓСЂРѕРІРЅСЏ {langLevel}</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 28 }}>
        {available.map(cat => {
          const on = selected.has(cat);
          return (
            <button key={cat} onClick={() => toggle(cat)} style={{ background: on ? "rgba(124,92,252,0.2)" : "rgba(255,255,255,0.04)", border: `1.5px solid ${on ? "#7C5CFC" : "rgba(255,255,255,0.1)"}`, borderRadius: 14, padding: "14px 12px", cursor: "pointer", textAlign: "left", transition: "all 0.2s" }}>
              <div style={{ fontSize: 22, marginBottom: 4 }}>{CATEGORY_ICONS[cat]}</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: on ? "#fff" : "rgba(255,255,255,0.5)" }}>{cat}</div>
              <div style={{ fontSize: 11, color: on ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.2)", marginTop: 2 }}>
                {ALL_QUESTIONS.filter(q => q.category === cat && q.level === langLevel).length} РІРѕРїСЂРѕСЃРѕРІ
              </div>
            </button>
          );
        })}
      </div>
      <button onClick={() => onStart([...selected])} style={{ width: "100%", background: "#7C5CFC", color: "#fff", border: "none", borderRadius: 16, padding: "18px", fontSize: 16, fontWeight: 700, cursor: "pointer" }}>
        РќР°С‡Р°С‚СЊ РєРІРµСЃС‚ в†’
      </button>
    </div>
  );
}

// в”Ђв”Ђ RESULT SCREEN в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ
function ResultScreen({ score, total, xpEarned, profile, onRestart, onProfile }) {
  const pct = Math.round((score / total) * 100);
  const emoji = pct >= 80 ? "рџЏ†" : pct >= 60 ? "в­ђ" : "рџ’Є";
  const msg = pct >= 80 ? "РћС‚Р»РёС‡РЅРѕ СЃС‹РіСЂР°РЅРѕ!" : pct >= 60 ? "РҐРѕСЂРѕС€РёР№ СЂРµР·СѓР»СЊС‚Р°С‚!" : "РџСЂРѕРґРѕР»Р¶Р°Р№ С‚СЂРµРЅРёСЂРѕРІР°С‚СЊСЃСЏ!";
  const partnerScore = Math.min(total, Math.max(0, score + Math.floor(Math.random() * 3) - 1));

  return (
    <div style={{ textAlign: "center", padding: "32px 0" }}>
      <div style={{ fontSize: 64, marginBottom: 16 }}>{emoji}</div>
      <div style={{ fontSize: 28, fontWeight: 700, color: "#fff", marginBottom: 8 }}>{msg}</div>
      <div style={{ fontSize: 15, color: "rgba(255,255,255,0.5)", marginBottom: 24 }}>Р’С‹ СЃ Maria РѕС‚РІРµС‚РёР»Рё РїСЂР°РІРёР»СЊРЅРѕ РЅР°</div>
      <div style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", background: "rgba(124,92,252,0.15)", border: "1px solid rgba(124,92,252,0.3)", borderRadius: 20, padding: "24px 48px", marginBottom: 20 }}>
        <div style={{ fontSize: 56, fontWeight: 800, color: "#7C5CFC" }}>{score}/{total}</div>
        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>{pct}% С‚РѕС‡РЅРѕСЃС‚СЊ</div>
      </div>
      <div style={{ background: "rgba(124,92,252,0.1)", border: "1px solid rgba(124,92,252,0.2)", borderRadius: 14, padding: "14px 20px", marginBottom: 20, display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
        <span style={{ fontSize: 20 }}>вљЎ</span>
        <span style={{ color: "#7C5CFC", fontWeight: 700, fontSize: 16 }}>+{xpEarned} XP</span>
        <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 13 }}>В· СѓСЂРѕРІРµРЅСЊ {getLevel(profile?.xp || 0)}</span>
      </div>
      <div style={{ display: "flex", gap: 12, justifyContent: "center", marginBottom: 28 }}>
        {[{ label: profile?.username || "С‚С‹", val: score }, { label: "Maria", val: partnerScore }].map(x => (
          <div key={x.label} style={{ background: "rgba(255,255,255,0.05)", borderRadius: 12, padding: "12px 20px", textAlign: "center" }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: "#fff" }}>{x.val}</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{x.label}</div>
          </div>
        ))}
      </div>
      <button onClick={onRestart} style={{ background: "#7C5CFC", color: "#fff", border: "none", borderRadius: 14, padding: "16px 40px", fontSize: 16, fontWeight: 600, cursor: "pointer", width: "100%", marginBottom: 10 }}>
        РќРѕРІС‹Р№ СЂР°СѓРЅРґ в†’
      </button>
      <button onClick={onProfile} style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 14, padding: "14px 40px", fontSize: 15, fontWeight: 500, cursor: "pointer", width: "100%" }}>
        РњРѕР№ РїСЂРѕС„РёР»СЊ рџ§‘вЂЌрџ’»
      </button>
    </div>
  );
}

// в”Ђв”Ђ PROFILE SCREEN в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ
function ProfileScreen({ profile, session, onUpdate, onBack, onRetakeTest }) {
  const [editing, setEditing] = useState(false);
  const [username, setUsername] = useState(profile?.username || "");
  const [saving, setSaving] = useState(false);

  const xp = profile?.xp || 0;
  const level = getLevel(xp);
  const progress = (xp % 200) / 200;
  const langLevel = profile?.lang_level || "вЂ”";
  const info = LEVEL_INFO[langLevel];
  const LEVEL_TITLES = ["РќРѕРІРёС‡РѕРє", "РЈС‡РµРЅРёРє", "РџСЂР°РєС‚РёРє", "Р—РЅР°С‚РѕРє", "РњР°СЃС‚РµСЂ", "Р­РєСЃРїРµСЂС‚"];
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
      <button onClick={onBack} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", fontSize: 13, cursor: "pointer", marginBottom: 24, padding: 0 }}>в†ђ РќР°Р·Р°Рґ</button>

      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <div style={{ width: 80, height: 80, borderRadius: 24, background: "rgba(124,92,252,0.2)", border: "2px solid rgba(124,92,252,0.4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, margin: "0 auto 16px" }}>рџ§‘вЂЌрџ’»</div>
        {editing ? (
          <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 8 }}>
            <input value={username} onChange={e => setUsername(e.target.value)} style={{ padding: "8px 12px", borderRadius: 10, background: "rgba(255,255,255,0.08)", border: "1.5px solid rgba(124,92,252,0.5)", color: "#fff", fontSize: 16, fontWeight: 700, textAlign: "center", outline: "none" }} />
            <button onClick={save} disabled={saving} style={{ background: "#7C5CFC", color: "#fff", border: "none", borderRadius: 10, padding: "8px 14px", cursor: "pointer", fontWeight: 600 }}>{saving ? "..." : "вњ“"}</button>
          </div>
        ) : (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 4 }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: "#fff" }}>{profile?.username || "РРіСЂРѕРє"}</div>
            <button onClick={() => setEditing(true)} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.3)", cursor: "pointer", fontSize: 14 }}>вњЏпёЏ</button>
          </div>
        )}
        <div style={{ fontSize: 13, color: "#7C5CFC", fontWeight: 600 }}>{title}</div>
      </div>

      {info && (
        <div style={{ background: `${info.color}15`, border: `1px solid ${info.color}30`, borderRadius: 14, padding: "14px 20px", marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginBottom: 4 }}>РЈР РћР’Р•РќР¬ РќР•РњР•Р¦РљРћР“Рћ</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: info.color }}>{langLevel}</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>{info.desc}</div>
          </div>
          <button onClick={onRetakeTest} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "8px 14px", color: "rgba(255,255,255,0.5)", fontSize: 12, cursor: "pointer" }}>
            РџСЂРѕР№С‚Рё СЃРЅРѕРІР°
          </button>
        </div>
      )}

      <div style={{ background: "rgba(124,92,252,0.1)", border: "1px solid rgba(124,92,252,0.2)", borderRadius: 20, padding: 20, marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>РЈСЂРѕРІРµРЅСЊ {level}</span>
          <span style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>{xp} XP</span>
        </div>
        <div style={{ height: 8, background: "rgba(255,255,255,0.08)", borderRadius: 4, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${progress * 100}%`, background: "#7C5CFC", borderRadius: 4, transition: "width 0.6s ease" }} />
        </div>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", marginTop: 8 }}>РµС‰С‘ {xpToNextLevel(xp)} XP РґРѕ СѓСЂРѕРІРЅСЏ {level + 1}</div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
        {[
          { label: "Р Р°СѓРЅРґРѕРІ СЃС‹РіСЂР°РЅРѕ", value: profile?.rounds_played || 0, icon: "рџЋ®" },
          { label: "Р’СЃРµРіРѕ XP", value: xp, icon: "вљЎ" },
          { label: "РЎРµСЂРёСЏ РґРЅРµР№", value: `${profile?.streak || 0} рџ”Ґ`, icon: "рџ“…" },
          { label: "Р”Рѕ СЃР»РµРґ. СѓСЂРѕРІРЅСЏ", value: `${xpToNextLevel(xp)} XP`, icon: "рџЋЇ" },
        ].map(item => (
          <div key={item.label} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: "14px 16px" }}>
            <div style={{ fontSize: 20, marginBottom: 6 }}>{item.icon}</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#fff" }}>{item.value}</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>{item.label}</div>
          </div>
        ))}
      </div>

      <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: "16px 20px", marginBottom: 12 }}>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", marginBottom: 12 }}>РќР°СЃС‚СЂРѕР№РєРё Р°РєРєР°СѓРЅС‚Р°</div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>Email</span>
          <span style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", fontFamily: "monospace" }}>{session.user.email}</span>
        </div>
      </div>

      <button onClick={() => supabase.auth.signOut()} style={{ width: "100%", background: "rgba(239,68,68,0.1)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 14, padding: "14px", fontSize: 15, fontWeight: 600, cursor: "pointer" }}>
        Р’С‹Р№С‚Рё РёР· Р°РєРєР°СѓРЅС‚Р°
      </button>
    </div>
  );
}

// в”Ђв”Ђ MAIN APP в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ
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
              // РќРѕРІС‹Р№ РїРѕР»СЊР·РѕРІР°С‚РµР»СЊ вЂ” РїРѕРєР°Р·Р°С‚СЊ РѕРЅР±РѕСЂРґРёРЅРі
              setScreen("onboarding");
            } else {
              // Р’РѕР·РІСЂР°С‰Р°СЋС‰РёР№СЃСЏ Р±РµР· СѓСЂРѕРІРЅСЏ вЂ” РїРѕСЃС‚Р°РІРёС‚СЊ A1 РїРѕ СѓРјРѕР»С‡Р°РЅРёСЋ
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

  const TYPE_LABEL = { translate: "РџРµСЂРµРІРѕРґ", fill: "РђСЂС‚РёРєР»Рё", choose: "Р“СЂР°РјРјР°С‚РёРєР°" };

  if (!session) return (
    <div style={{ minHeight: "100vh", background: "#0f0d1a", display: "flex", justifyContent: "center", fontFamily: "'Inter', system-ui, sans-serif" }}>
      <div style={{ width: "100%", maxWidth: 420, padding: "0 20px 40px" }}><AuthScreen /></div>
    </div>
  );

  // Р–РґС‘Рј Р·Р°РіСЂСѓР·РєСѓ РїСЂРѕС„РёР»СЏ
  if (!profile) return (
    <div style={{ minHeight: "100vh", background: "#0f0d1a", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.3)", fontFamily: "'Inter', system-ui, sans-serif" }}>
      Р—Р°РіСЂСѓР·РєР°...
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
                рџ§‘вЂЌрџ’»
              </button>
            </div>

            <div style={{ marginBottom: 32 }}>
              <div style={{ fontSize: 11, letterSpacing: 3, color: "#7C5CFC", fontWeight: 600, marginBottom: 12, textTransform: "uppercase" }}>DuoPar В· Deutsch</div>
              <h1 style={{ fontSize: 32, fontWeight: 800, color: "#fff", margin: 0, lineHeight: 1.2 }}>
                РЈС‡Рё РЅРµРјРµС†РєРёР№<br /><span style={{ color: "#7C5CFC" }}>РІРјРµСЃС‚Рµ</span>
              </h1>
              <div style={{ display: "flex", gap: 16, marginTop: 14 }}>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.35)" }}>
                  рџЋ® {profile?.rounds_played || 0} СЂР°СѓРЅРґРѕРІ
                </div>
                {(profile?.streak || 0) > 0 && (
                  <div style={{ fontSize: 13, color: "#f59e0b", fontWeight: 600 }}>
                    рџ”Ґ {profile.streak} {profile.streak === 1 ? "РґРµРЅСЊ" : profile.streak < 5 ? "РґРЅСЏ" : "РґРЅРµР№"} РїРѕРґСЂСЏРґ
                  </div>
                )}
              </div>
            </div>

            <button onClick={() => setScreen("curriculum")} style={{ width: "100%", background: "linear-gradient(135deg, rgba(124,92,252,0.2), rgba(124,92,252,0.08))", color: "#fff", border: "1px solid rgba(124,92,252,0.35)", borderRadius: 20, padding: "20px", fontSize: 16, fontWeight: 700, cursor: "pointer", textAlign: "left", marginBottom: 10 }}>
              <div style={{ fontSize: 24, marginBottom: 6 }}>рџЋ“</div>
              <div>РџСЂРѕРіСЂР°РјРјР° РѕР±СѓС‡РµРЅРёСЏ</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", fontWeight: 400, marginTop: 4 }}>{completedTopics.length} РёР· {CURRICULUM.length} С‚РµРј РїСЂРѕР№РґРµРЅРѕ</div>
            </button>

            <button onClick={() => setScreen("setup")} style={{ width: "100%", background: "#7C5CFC", color: "#fff", border: "none", borderRadius: 16, padding: "16px", fontSize: 15, fontWeight: 700, cursor: "pointer" }}>
              рџЋ® РРіСЂР°С‚СЊ в†’
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
        {screen === "setup" && !needsPlacement && <SetupScreen langLevel={langLevel} onStart={startGame} onBack={() => setScreen("lobby")} />}

        {/* QUIZ */}
        {screen === "quiz" && q && (
          <div style={{ paddingTop: 40 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", fontWeight: 500 }}>{qIndex + 1} / {questions.length}</div>
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <span style={{ fontSize: 12, color: "#7C5CFC", fontWeight: 600 }}>вљЎ {(profile?.xp || 0) + xpEarned} XP</span>
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
                  {revealed && i === q.correct && <span style={{ float: "right" }}>вњ“</span>}
                  {revealed && i === selected && selected !== q.correct && <span style={{ float: "right" }}>вњ—</span>}
                </button>
              ))}
            </div>
            {!revealed && (
              <button onClick={() => setShowHint(h => !h)} style={{ background: "transparent", border: "none", color: "rgba(255,255,255,0.3)", fontSize: 13, cursor: "pointer", padding: "4px 0", textDecoration: "underline", textUnderlineOffset: 3 }}>
                {showHint ? "РЎРєСЂС‹С‚СЊ РїРѕРґСЃРєР°Р·РєСѓ" : "РџРѕРґСЃРєР°Р·РєР°"}
              </button>
            )}
            {showHint && !revealed && (
              <div style={{ marginTop: 10, padding: "10px 14px", background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: 10, fontSize: 13, color: "#f59e0b" }}>
                рџ’Ў {q.hint}
              </div>
            )}
            {revealed && (
              <div style={{ marginTop: 16, padding: "12px 16px", background: selected === q.correct ? "rgba(16,185,129,0.08)" : "rgba(239,68,68,0.08)", border: `1px solid ${selected === q.correct ? "rgba(16,185,129,0.25)" : "rgba(239,68,68,0.2)"}`, borderRadius: 12, fontSize: 13, color: selected === q.correct ? "#10b981" : "#ef4444", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>{selected === q.correct ? "вњ“ РџСЂР°РІРёР»СЊРЅРѕ!" : `вњ— Р’РµСЂРЅРѕ: ${q.options[q.correct]}`}</span>
                {countdown !== null && <span style={{ opacity: 0.6, fontSize: 12 }}>РґР°Р»РµРµ С‡РµСЂРµР· {countdown}...</span>}
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

