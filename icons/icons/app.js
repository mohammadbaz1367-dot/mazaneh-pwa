import { createElement as h, useMemo, useState } from 'https://esm.sh/react@18';
import { createRoot } from 'https://esm.sh/react-dom@18/client';

function formatNumber(n){
  if (isNaN(n)) return "—";
  return new Intl.NumberFormat("fa-IR").format(Math.round(n));
}

function NumberInput({ label, value, onChange, step=1000, min=0 }) {
  return h('label', { className: 'flex items-center gap-2 justify-between bg-white p-3 rounded-2xl shadow' },
    h('span', { className: 'font-semibold' }, label),
    h('input', {
      type: 'number',
      className: 'border rounded-xl px-3 py-2 w-52 text-right',
      value: value, min, step,
      onChange: (e)=> onChange(+e.target.value || 0)
    })
  );
}

function Row({ left, right }){
  return h('div', { className: 'flex items-center justify-between bg-white p-3 rounded-xl shadow' },
    h('span', { className: 'font-semibold' }, left),
    h('span', { className: 'font-mono' }, formatNumber(right))
  );
}

function Card({ title, children }){
  return h('div', { className: 'bg-gray-100 rounded-2xl p-4 md:p-6 space-y-3 shadow-inner' },
    h('h3', { className: 'font-bold text-lg mb-2' }, title),
    h('div', { className: 'grid gap-2' }, children)
  );
}

// 1) Percent TP/SL
function PercentTP_SL(){
  const [buyPrice, setBuyPrice] = useState(46000000);
  const res = useMemo(()=>{
    const p = buyPrice || 0;
    return {
      tp05: p * 1.005,
      tp1: p * 1.01,
      sl03: p * 0.997,
      sl05: p * 0.995,
    }
  },[buyPrice]);

  return h('section', { className: 'space-y-4' },
    h(Card, { title: 'ورودی' },
      h(NumberInput, { label: 'قیمت خرید (تومان/مثقال)', value: buyPrice, onChange: setBuyPrice })
    ),
    h('div', { className: 'grid md:grid-cols-2 gap-4' },
      h(Card, { title: 'حد سود' },
        h(Row, { left: 'سود ۰.۵٪', right: res.tp05 }),
        h(Row, { left: 'سود ۱٪', right: res.tp1 }),
      ),
      h(Card, { title: 'حد ضرر' },
        h(Row, { left: 'ضرر ۰.۳٪', right: res.sl03 }),
        h(Row, { left: 'ضرر ۰.۵٪', right: res.sl05 }),
      ),
    ),
  );
}

// 2) Sell -> Buyback planner
function SellBuybackPlanner(){
  const [sellPrice, setSellPrice] = useState(46000000);
  const res = useMemo(()=>{
    const p = sellPrice || 0;
    return {
      buy03: p * 0.997,
      buy05: p * 0.995,
      buy08: p * 0.992,
      buy10: p * 0.99,
      sl03: p * 1.003,
      sl05: p * 1.005,
      prof03: p - (p*0.997),
      prof05: p - (p*0.995),
      prof08: p - (p*0.992),
      prof10: p - (p*0.99),
    }
  },[sellPrice]);

  return h('section', { className: 'space-y-4' },
    h(Card, { title: 'ورودی' },
      h(NumberInput, { label: 'قیمت فروش (تومان/مثقال)', value: sellPrice, onChange: setSellPrice })
    ),
    h('div', { className: 'grid md:grid-cols-2 gap-4' },
      h(Card, { title: 'اهداف بازخرید (پایین‌تر)' },
        h(Row, { left: '۰.۳٪ پایین‌تر', right: res.buy03 }),
        h(Row, { left: '۰.۵٪ پایین‌تر', right: res.buy05 }),
        h(Row, { left: '۰.۸٪ پایین‌تر', right: res.buy08 }),
        h(Row, { left: '۱.۰٪ پایین‌تر', right: res.buy10 }),
      ),
      h(Card, { title: 'حدضرر فروش (بالا)' },
        h(Row, { left: '+۰.۳٪', right: res.sl03 }),
        h(Row, { left: '+۰.۵٪', right: res.sl05 }),
      ),
    ),
    h(Card, { title: 'سود تقریبی هر مثقال (اگر در هدف بازخرید کنی)' },
      h(Row, { left: 'در ۰.۳٪', right: res.prof03 }),
      h(Row, { left: 'در ۰.۵٪', right: res.prof05 }),
      h(Row, { left: 'در ۰.۸٪', right: res.prof08 }),
      h(Row, { left: 'در ۱.۰٪', right: res.prof10 }),
    ),
  );
}

// 3) Pas-Fardaei (T+2) – fixed Δ (default 300k)
function PasFardaeiFixed(){
  const [cash, setCash] = useState(46000000);
  const [premium, setPremium] = useState(300000);
  const [delta, setDelta] = useState(300000);

  const buy = useMemo(()=>{
    const price = (cash||0) + (premium||0);
    return {
      price,
      tp: price + (delta||0),
      sl: price - (delta||0),
      tp2: price + 2*(delta||0),
      sl2: price - 2*(delta||0),
      tp3: price + 3*(delta||0),
      sl3: price - 3*(delta||0),
    }
  },[cash, premium, delta]);

  const sell = useMemo(()=>{
    const price = (cash||0) + (premium||0);
    return {
      price,
      buyback: price - (delta||0),
      sl: price + (delta||0),
      buyback2: price - 2*(delta||0),
      sl2: price + 2*(delta||0),
      buyback3: price - 3*(delta||0),
      sl3: price + 3*(delta||0),
    }
  },[cash, premium, delta]);

  return h('section', { className: 'space-y-4' },
    h(Card, { title: 'ورودی‌ها' },
      h(NumberInput, { label: 'قیمت نقدی امروز (تومان)', value: cash, onChange: setCash }),
      h(NumberInput, { label: 'پریمیوم پس‌فردایی نسبت به نقدی', value: premium, onChange: setPremium, step: 5000 }),
      h(NumberInput, { label: 'Δ حرکت برای حد سود/ضرر (تومان)', value: delta, onChange: setDelta, step: 5000 }),
    ),
    h('div', { className: 'grid md:grid-cols-2 gap-4' },
      h(Card, { title: 'خرید پس‌فردایی (T+2)' },
        h(Row, { left: 'قیمت خرید', right: buy.price }),
        h(Row, { left: '🎯 حد سود (+Δ)', right: buy.tp }),
        h(Row, { left: '⚠️ حد ضرر (−Δ)', right: buy.sl }),
        h(Row, { left: 'سود ۲Δ', right: buy.tp2 }),
        h(Row, { left: 'ضرر ۲Δ', right: buy.sl2 }),
        h(Row, { left: 'سود ۳Δ', right: buy.tp3 }),
        h(Row, { left: 'ضرر ۳Δ', right: buy.sl3 }),
      ),
      h(Card, { title: 'فروش پس‌فردایی (T+2)' },
        h(Row, { left: 'قیمت فروش', right: sell.price }),
        h(Row, { left: '📉 بازخرید (−Δ)', right: sell.buyback }),
        h(Row, { left: '⚠️ حدضرر (+Δ)', right: sell.sl }),
        h(Row, { left: 'بازخرید ۲Δ', right: sell.buyback2 }),
        h(Row, { left: 'حدضرر ۲Δ', right: sell.sl2 }),
        h(Row, { left: 'بازخرید ۳Δ', right: sell.buyback3 }),
        h(Row, { left: 'حدضرر ۳Δ', right: sell.sl3 }),
      ),
    ),
  );
}

function Tabs(){\n  const [tab, setTab] = useState('percent');\n  const tabs = [\n    {key:'percent', label:'حد سود/ضرر درصدی', comp: PercentTP_SL},\n    {key:'sellbuyback', label:'فروش → بازخرید', comp: SellBuybackPlanner},\n    {key:'pasfixed', label:'پس‌فردایی (Δ ثابت)', comp: PasFardaeiFixed},\n  ];\n  const Active = tabs.find(t=>t.key===tab).comp;\n  return h('div', { className: 'max-w-5xl mx-auto p-4 md:p-8' },\n    h('div', { className: 'flex flex-wrap gap-2 justify-center mb-6' },\n      tabs.map(t=> h('button', {\n        key:t.key,\n        onClick:()=>setTab(t.key),\n        className: `px-4 py-2 rounded-2xl shadow ${tab===t.key? 'bg-black text-white':'bg-white'}`\n      }, t.label))\n    ),\n    h('div', null, h(Active))\n  );\n}\n\nfunction App(){\n  return h('div', { className: 'min-h-screen bg-gray-50 text-gray-900' },\n    h('header', { className: 'py-6 text-center' },\n      h('h1', { className: 'text-2xl md:text-3xl font-bold' }, 'ماشین‌حساب مظنه آبشده – PWA'),\n      h('p', { className: 'mt-2 text-sm md:text-base' }, 'ورود قیمت و دریافت حد سود/ضرر برای سناریوهای مختلف (کوتاه‌مدت ایران)')\n    ),\n    h(Tabs),\n    h('footer', { className: 'mt-8 text-xs text-center text-gray-500 pb-8' },\n      'نکته: اعداد به تومان/مثقال هستند. معاملات کوتاه‌مدت پرریسک‌اند — حتماً حدضرر را رعایت کنید.'\n    )\n  );\n}\n\nconst root = createRoot(document.getElementById('root'));\nroot.render(h(App));\n