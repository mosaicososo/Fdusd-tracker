import { useState, useEffect, useRef, useCallback } from "react";

const SYMBOLS = ['btcfdusd','ethfdusd','solfdusd','bnbfdusd','xrpfdusd','avaxfdusd','ltcfdusd'];

// ─── STORAGE HELPERS ───────────────────────────────────────────
const save = (key, value) => { try { localStorage.setItem(key, JSON.stringify(value)); } catch(e) {} };
const load = (key, fallback) => { try { const r = localStorage.getItem(key); return r ? JSON.parse(r) : fallback; } catch { return fallback; } };

// ─── STRATEGY WIDGET ───────────────────────────────────────────
function StrategyWidget({ reference, currentRatio, isCycleActive = false, threshold = 0.5 }) {
  const deviation = (currentRatio / reference) - 1;
  const deviationPercent = (deviation * 100).toFixed(2);
  const signalVal = threshold / 100;
  const neutralVal = signalVal / 2;
  const isNeutral = Math.abs(deviation) <= neutralVal;
  const isSignalDown = deviation <= -signalVal;
  const isSignalUp = deviation >= signalVal;
  const potentialGain = (Math.abs(deviation) * 100).toFixed(2);
  const range = signalVal * 2;
  const clamp = (v, mn, mx) => Math.min(Math.max(v, mn), mx);
  const position = clamp(((deviation + range) / (range * 2)) * 100, 0, 100);

  const s = {
    wrap: { background:'rgba(24,24,27,0.8)', border:'1px solid rgba(99,102,241,0.3)', borderRadius:32, padding:24, position:'relative', overflow:'hidden', boxShadow:'0 0 40px rgba(79,70,229,0.1)', width:'100%' },
    glow: { position:'absolute', top:0, right:0, width:160, height:160, background:'rgba(99,102,241,0.05)', filter:'blur(60px)', borderRadius:'50%', marginRight:-80, marginTop:-80 },
    header: { display:'flex', justifyContent:'space-between', alignItems:'flex-start', position:'relative', zIndex:1 },
    badge: { padding:'6px 12px', borderRadius:12, fontSize:10, fontWeight:900, border:'1px solid', background: isSignalDown?'rgba(239,68,68,0.2)':isSignalUp?'rgba(34,197,94,0.2)':isNeutral?'rgba(39,39,42,1)':'rgba(99,102,241,0.2)', borderColor: isSignalDown?'rgba(239,68,68,0.5)':isSignalUp?'rgba(34,197,94,0.5)':isNeutral?'#3f3f46':'rgba(99,102,241,0.5)', color: isSignalDown?'#f87171':isSignalUp?'#4ade80':isNeutral?'#71717a':'#818cf8' },
    dot: { width:8, height:8, borderRadius:'50%', background:isCycleActive?'#f97316':'#6366f1', boxShadow:isCycleActive?'0 0 8px rgba(249,115,22,0.4)':'0 0 8px rgba(99,102,241,0.4)' },
    indicator: { position:'absolute', top:4, width:20, height:20, borderRadius:'50%', border:'2px solid #09090b', zIndex:10, transition:'all 0.3s ease', left:`calc(${position}% - 10px)`, background:isSignalDown?'#ef4444':isSignalUp?'#22c55e':'#6366f1', boxShadow:isSignalDown?'0 0 8px rgba(239,68,68,0.4)':isSignalUp?'0 0 8px rgba(34,197,94,0.4)':'0 0 8px rgba(99,102,241,0.3)' }
  };

  return (
    <div style={s.wrap}>
      <div style={s.glow}/>
      <div style={s.header}>
        <div>
          <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:4}}>
            <span style={{fontSize:10,fontWeight:900,color:'#71717a',textTransform:'uppercase',letterSpacing:'0.2em'}}>Optimización Pasiva</span>
            <div style={s.dot}/>
          </div>
          <div style={{fontSize:22,fontWeight:900,color:'white',fontFamily:'monospace',fontStyle:'italic'}}>BTC <span style={{color:'#6366f1'}}>↔</span> ETH</div>
        </div>
        <div style={s.badge}>{isSignalDown?`SEÑAL: -${threshold}%`:isSignalUp?`SEÑAL: +${threshold}%`:isNeutral?'ZONA NEUTRA':'DESVIACIÓN'}</div>
      </div>

      <div style={{marginTop:20,display:'flex',flexDirection:'column',gap:16}}>
        {(isSignalDown||isSignalUp) && (
          <div style={{padding:16,borderRadius:24,border:'1px solid',background:isSignalDown?'rgba(239,68,68,0.1)':'rgba(34,197,94,0.1)',borderColor:isSignalDown?'rgba(239,68,68,0.3)':'rgba(34,197,94,0.3)'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',borderBottom:'1px solid rgba(255,255,255,0.05)',paddingBottom:8,marginBottom:12}}>
              <span style={{fontSize:9,fontWeight:900,color:'#52525b',textTransform:'uppercase',letterSpacing:'0.2em'}}>Acción Sugerida</span>
              <span style={{fontSize:11,fontWeight:900,textTransform:'uppercase',color:isSignalDown?'#f87171':'#4ade80'}}>{isSignalDown?'BTC ➔ ETH':'ETH ➔ BTC'}</span>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
              <div>
                <span style={{fontSize:9,fontWeight:900,color:'#3f3f46',textTransform:'uppercase',display:'block',marginBottom:2}}>Ratio Entrada</span>
                <span style={{fontSize:20,fontFamily:'monospace',fontWeight:900,color:'white'}}>{currentRatio.toFixed(5)}</span>
              </div>
              <div style={{textAlign:'right'}}>
                <span style={{fontSize:9,fontWeight:900,color:'#3f3f46',textTransform:'uppercase',display:'block',marginBottom:2}}>Profit Ciclo</span>
                <span style={{fontSize:20,fontFamily:'monospace',fontWeight:900,color:isSignalDown?'#f87171':'#4ade80'}}>+{potentialGain}%</span>
              </div>
            </div>
          </div>
        )}

        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-end'}}>
          <div style={{display:'flex',flexDirection:'column',gap:2}}>
            <span style={{fontSize:9,opacity:0.5,fontWeight:'bold',letterSpacing:'0.1em',color:'#71717a',textTransform:'uppercase'}}>Referencia</span>
            <span style={{fontSize:18,color:'white',fontFamily:'monospace',fontWeight:900}}>{reference.toFixed(5)}</span>
            <span style={{fontSize:8,color:'rgba(239,68,68,0.6)',fontWeight:900,letterSpacing:'0.2em'}}>ETH DÉBIL</span>
          </div>
          <div style={{textAlign:'center'}}>
            <div style={{fontSize:20,fontFamily:'monospace',fontWeight:900,color:isNeutral?'#71717a':deviation>0?'#4ade80':'#f87171'}}>{deviation>0?'+':''}{deviationPercent}%</div>
          </div>
          <div style={{display:'flex',flexDirection:'column',gap:2,textAlign:'right'}}>
            <span style={{fontSize:9,opacity:0.5,fontWeight:'bold',letterSpacing:'0.1em',color:'#71717a',textTransform:'uppercase'}}>Ratio Actual</span>
            <span style={{fontSize:18,color:'white',fontFamily:'monospace',fontWeight:900}}>{currentRatio.toFixed(5)}</span>
            <span style={{fontSize:8,color:'rgba(34,197,94,0.6)',fontWeight:900,letterSpacing:'0.2em'}}>BTC FUERTE</span>
          </div>
        </div>

        <div style={{position:'relative',height:28,background:'rgba(9,9,11,0.8)',borderRadius:12,border:'1px solid rgba(255,255,255,0.05)',padding:4}}>
          <div style={{position:'absolute',top:0,bottom:0,left:'37.5%',right:'37.5%',background:'rgba(39,39,42,0.3)',borderLeft:'1px solid rgba(255,255,255,0.05)',borderRight:'1px solid rgba(255,255,255,0.05)'}}/>
          <div style={{position:'absolute',left:'25%',top:0,bottom:0,width:2,background:'rgba(239,68,68,0.2)'}}/>
          <div style={{position:'absolute',right:'25%',top:0,bottom:0,width:2,background:'rgba(34,197,94,0.2)'}}/>
          <div style={{position:'absolute',left:'50%',top:0,bottom:0,width:1,background:'rgba(255,255,255,0.1)'}}/>
          <div style={s.indicator}/>
        </div>

        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
          <div style={{background:'rgba(0,0,0,0.3)',borderRadius:16,padding:16,border:'1px solid rgba(255,255,255,0.05)'}}>
            <span style={{fontSize:8,fontWeight:900,color:'#3f3f46',textTransform:'uppercase',display:'block',marginBottom:4,letterSpacing:'0.15em'}}>Zona Neutra (±{(threshold/2).toFixed(2)}%)</span>
            <span style={{fontSize:10,fontFamily:'monospace',fontWeight:900,color:'#71717a'}}>{(reference*(1-(threshold/200))).toFixed(5)} — {(reference*(1+(threshold/200))).toFixed(5)}</span>
          </div>
          <div style={{background:'rgba(0,0,0,0.3)',borderRadius:16,padding:16,border:'1px solid rgba(255,255,255,0.05)',textAlign:'right'}}>
            <span style={{fontSize:8,fontWeight:900,color:'#3f3f46',textTransform:'uppercase',display:'block',marginBottom:4,letterSpacing:'0.15em'}}>Límites (±{threshold}%)</span>
            <div style={{display:'flex',justifyContent:'flex-end',gap:8,fontSize:10,fontFamily:'monospace',fontWeight:900}}>
              <span style={{color:'rgba(239,68,68,0.7)'}}>{(reference*(1-(threshold/100))).toFixed(5)}</span>
              <span style={{color:'#27272a'}}>|</span>
              <span style={{color:'rgba(34,197,94,0.7)'}}>{(reference*(1+(threshold/100))).toFixed(5)}</span>
            </div>
          </div>
        </div>
      </div>

      <div style={{marginTop:16,paddingTop:16,borderTop:'1px solid rgba(255,255,255,0.05)',fontSize:9,fontWeight:900,color:'#52525b',textTransform:'uppercase',display:'flex',alignItems:'center',gap:8}}>
        <span style={{color:isCycleActive?'#f97316':'rgba(99,102,241,0.4)'}}>{isCycleActive?'⟳':'✓'}</span>
        <span>{isCycleActive?`Ciclo activo (±${threshold}%). Esperando retorno a zona neutra.`:isNeutral?'Equilibrio de mercado.':`Desviación fuera de zona neutra (umbral ±${threshold}%).`}</span>
      </div>
    </div>
  );
}

// ─── CRYPTO WIDGET ─────────────────────────────────────────────
function CryptoWidget({ baseAsset, targetAsset, currentUnits, targetUnits, minUnits, maxUnits }) {
  const progress = Math.min((currentUnits / targetUnits) * 100, 100);
  const isTargetReached = currentUnits >= targetUnits;
  const isNear = progress > 90;
  const isStrategic = (baseAsset==='BTC'&&targetAsset==='ETH')||(baseAsset==='ETH'&&targetAsset==='BTC');

  const fmt = (n, asset) => {
    if (asset==='BTC') return n.toLocaleString(undefined,{minimumFractionDigits:4,maximumFractionDigits:4});
    if (n>1000) return n.toLocaleString(undefined,{maximumFractionDigits:0});
    if (n>100) return n.toFixed(1);
    return n.toFixed(2);
  };

  const borderColor = isTargetReached?'rgba(34,197,94,0.6)':isNear?'rgba(239,68,68,0.4)':'rgba(255,255,255,0.1)';
  const bg = isTargetReached?'rgba(5,46,22,0.3)':isNear?'rgba(69,10,10,0.3)':'rgba(24,24,27,0.9)';
  const barColor = isTargetReached?'#22c55e':isNear?'#ef4444':'#6366f1';

  return (
    <div style={{position:'relative',overflow:'hidden',width:300,height:340,borderRadius:48,padding:24,display:'flex',flexDirection:'column',justifyContent:'space-between',border:`1px solid ${borderColor}`,background:bg,boxShadow:`0 0 60px ${isTargetReached?'rgba(34,197,94,0.3)':isNear?'rgba(239,68,68,0.2)':'rgba(99,102,241,0.15)'}`,flexShrink:0}}>
      <div style={{position:'absolute',top:-80,right:-80,width:200,height:200,background:barColor,opacity:0.15,filter:'blur(60px)',borderRadius:'50%'}}/>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',position:'relative',zIndex:1}}>
        <div>
          <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:4}}>
            <span style={{fontSize:11,fontWeight:900,color:'#52525b',textTransform:'uppercase',letterSpacing:'0.3em'}}>{baseAsset}</span>
            {isStrategic&&<span style={{fontSize:7,background:'rgba(249,115,22,0.2)',color:'#fb923c',padding:'2px 6px',borderRadius:6,fontWeight:900,letterSpacing:'0.2em',border:'1px solid rgba(249,115,22,0.2)'}}>ESTRATEGIA</span>}
          </div>
          <div style={{fontSize:13,fontWeight:900,color:'white',fontFamily:'monospace',fontStyle:'italic'}}>{baseAsset} <span style={{color:'#6366f1'}}>➔</span> {targetAsset}</div>
        </div>
        <div style={{padding:'6px 12px',borderRadius:16,fontSize:11,fontWeight:900,border:'1px solid',borderColor:isTargetReached?'rgba(34,197,94,0.5)':isNear?'rgba(239,68,68,0.5)':'rgba(99,102,241,0.4)',color:isTargetReached?'#4ade80':isNear?'#f87171':'#818cf8',background:isTargetReached?'rgba(34,197,94,0.2)':isNear?'rgba(239,68,68,0.2)':'rgba(99,102,241,0.2)'}}>
          {isTargetReached?'¡META!':`${progress.toFixed(1)}%`}
        </div>
      </div>

      <div style={{display:'flex',flexDirection:'column',alignItems:'center',position:'relative',zIndex:1}}>
        <div style={{fontSize:48,fontFamily:'monospace',fontWeight:900,lineHeight:1,letterSpacing:'-0.03em',marginBottom:14,color:isTargetReached?'#4ade80':'white',textShadow:isTargetReached?'0 0 15px rgba(34,197,94,0.5)':undefined}}>
          {fmt(currentUnits,targetAsset)}
        </div>
        <div style={{width:'100%',display:'flex',alignItems:'center',justifyContent:'space-between',gap:12,background:'rgba(0,0,0,0.4)',padding:14,borderRadius:20,border:'1px solid rgba(255,255,255,0.05)'}}>
          <div><span style={{fontSize:8,fontWeight:900,color:'#3f3f46',textTransform:'uppercase',letterSpacing:'0.15em',display:'block',marginBottom:4}}>Mín. Hist.</span><span style={{fontSize:12,fontFamily:'monospace',fontWeight:'bold',color:'#a1a1aa'}}>{minUnits!==undefined?fmt(minUnits,targetAsset):'--'}</span></div>
          <div style={{width:1,height:36,background:'#27272a'}}/>
          <div style={{textAlign:'right'}}><span style={{fontSize:8,fontWeight:900,color:'#3f3f46',textTransform:'uppercase',letterSpacing:'0.15em',display:'block',marginBottom:4}}>Máx. Hist.</span><span style={{fontSize:12,fontFamily:'monospace',fontWeight:'bold',color:'#a1a1aa'}}>{maxUnits!==undefined?fmt(maxUnits,targetAsset):'--'}</span></div>
        </div>
      </div>

      <div style={{display:'flex',flexDirection:'column',gap:10,position:'relative',zIndex:1}}>
        <div style={{width:'100%',height:10,background:'rgba(39,39,42,0.6)',borderRadius:9999,overflow:'hidden',border:'1px solid rgba(255,255,255,0.05)',padding:1}}>
          <div style={{height:'100%',borderRadius:9999,width:`${progress}%`,transition:'width 1s ease',background:barColor}}/>
        </div>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <div><span style={{fontSize:9,fontWeight:900,color:'#52525b',textTransform:'uppercase',letterSpacing:'0.1em'}}>Meta ({targetAsset})</span><div style={{fontSize:16,fontFamily:'monospace',fontWeight:900,color:isTargetReached?'#4ade80':'white'}}>{fmt(targetUnits,targetAsset)}</div></div>
          <div style={{width:36,height:36,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)',color:isTargetReached?'#4ade80':'#52525b',fontSize:12}}>{isTargetReached?'✓':isStrategic?'⇄':'⊙'}</div>
        </div>
      </div>
    </div>
  );
}

// ─── CRYPTO CARD ───────────────────────────────────────────────
function CryptoCard({ data, balance, onBalanceChange, allMarketData, isUsingCustomRef, threshold, history, alerts, onAlertChange }) {
  const [flash, setFlash] = useState('');
  const prevPrice = useRef(data.price);

  useEffect(() => {
    if (data.price > prevPrice.current) setFlash('up');
    else if (data.price < prevPrice.current) setFlash('down');
    const t = setTimeout(() => setFlash(''), 400);
    prevPrice.current = data.price;
    return () => clearTimeout(t);
  }, [data.price]);

  const totalUsd = balance * data.price;
  const isBTC = data.baseAsset === 'BTC';

  const opportunities = SYMBOLS
    .filter(s => s !== data.symbol && allMarketData[s])
    .map(s => {
      const target = allMarketData[s];
      let rel = 0;
      if (isUsingCustomRef && data.entryPrice && target.entryPrice) {
        rel = (((data.price/target.price)/(data.entryPrice/target.entryPrice))-1)*100;
      } else {
        rel = (((1+data.changePercent24h/100)/(1+target.changePercent24h/100))-1)*100;
      }
      const h = history[s];
      return { symbol:s, asset:target.baseAsset, percent:rel, units:totalUsd/target.price, min:h?balance*h.min:undefined, max:h?balance*h.max:undefined, alertTarget:alerts[s]||0 };
    });

  const flashBg = flash==='up'?'rgba(34,197,94,0.05)':flash==='down'?'rgba(239,68,68,0.05)':'transparent';

  return (
    <div style={{display:'flex',flexDirection:'column',background:`rgba(24,24,27,0.5)`,border:'1px solid rgba(39,39,42,0.5)',borderRadius:16,padding:16,backgroundColor:flashBg,transition:'background-color 0.4s'}}>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16}}>
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          <div style={{width:36,height:36,borderRadius:10,background:'#27272a',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:900,color:'#818cf8',border:'1px solid rgba(255,255,255,0.05)'}}>{data.baseAsset[0]}</div>
          <div>
            <div style={{fontSize:14,fontWeight:900,textTransform:'uppercase',color:'white',letterSpacing:'-0.02em'}}>{data.baseAsset}</div>
            {isUsingCustomRef&&data.entryPrice&&<span style={{fontSize:10,color:'#52525b',fontFamily:'monospace',fontWeight:'bold',background:'#09090b',padding:'1px 6px',borderRadius:4}}>Ref: ${data.entryPrice.toFixed(isBTC?4:2)}</span>}
          </div>
        </div>
        <div style={{textAlign:'right'}}>
          <div style={{fontSize:18,fontFamily:'monospace',fontWeight:900,color:'white',letterSpacing:'-0.03em'}}>${data.price.toLocaleString(undefined,{minimumFractionDigits:isBTC?4:2,maximumFractionDigits:isBTC?4:2})}</div>
          <div style={{fontSize:11,fontWeight:900,color:data.changePercent24h>=0?'#34d399':'#f87171'}}>{data.changePercent24h>=0?'▲':'▼'} {Math.abs(data.changePercent24h).toFixed(2)}%</div>
        </div>
      </div>

      <div style={{display:'flex',alignItems:'center',gap:12,background:'rgba(9,9,11,0.5)',padding:12,borderRadius:12,border:'1px solid rgba(255,255,255,0.05)'}}>
        <div style={{flex:1}}>
          <span style={{fontSize:9,fontWeight:900,color:'#3f3f46',textTransform:'uppercase',display:'block',marginBottom:4}}>Balance</span>
          <input type="number" value={balance||''} onChange={e=>onBalanceChange(parseFloat(e.target.value)||0)} placeholder="0.00" style={{width:'100%',background:'transparent',border:'none',outline:'none',fontSize:14,fontFamily:'monospace',fontWeight:900,color:'white'}}/>
        </div>
        <div style={{width:1,height:32,background:'#27272a'}}/>
        <div style={{textAlign:'right'}}>
          <span style={{fontSize:9,fontWeight:900,color:'#3f3f46',textTransform:'uppercase',display:'block'}}>Valor Total</span>
          <span style={{fontSize:14,fontFamily:'monospace',fontWeight:900,color:'#818cf8'}}>${totalUsd.toFixed(2)}</span>
        </div>
      </div>

      {balance>0&&(
        <div style={{marginTop:16,paddingTop:16,borderTop:'1px solid rgba(39,39,42,0.5)',display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
          {opportunities.map(op=>{
            const isAlert=op.percent>=threshold;
            const isReached=op.alertTarget>0&&op.units>=op.alertTarget;
            const isBTCasset=op.asset==='BTC';
            return(
              <div key={op.asset} style={{padding:12,borderRadius:16,border:'1px solid',transition:'all 0.3s',background:isReached?'rgba(24,24,27,1)':isAlert?'rgba(39,39,42,1)':'rgba(39,39,42,0.3)',borderColor:isReached?'rgba(34,197,94,0.5)':isAlert?'rgba(52,211,153,0.5)':'#27272a'}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
                  <span style={{fontSize:10,fontWeight:900,textTransform:'uppercase',color:isReached?'#4ade80':'#52525b'}}>{op.asset}</span>
                  <span style={{fontSize:10,color:isReached?'#4ade80':op.alertTarget>0?'#818cf8':'#27272a'}}>{isReached?'✓':'⊙'}</span>
                </div>
                <div style={{marginBottom:8}}>
                  <span style={{fontSize:12,fontFamily:'monospace',fontWeight:900,color:isReached?'#4ade80':op.percent>=0?'#34d399':'#f87171'}}>{op.percent>0?'+':''}{op.percent.toFixed(2)}%</span>
                  <div style={{fontSize:12,fontFamily:'monospace',fontWeight:900,color:isReached?'white':'#d4d4d8'}}>{op.units.toFixed(isBTCasset?4:2)}u</div>
                </div>
                <div style={{paddingTop:8,borderTop:'1px solid rgba(255,255,255,0.05)'}}>
                  <div style={{display:'flex',alignItems:'center',gap:4,background:'rgba(0,0,0,0.2)',borderRadius:8,padding:'4px 8px',marginBottom:6}}>
                    <span style={{fontSize:7,fontWeight:900,color:'#3f3f46'}}>META</span>
                    <input type="number" step="0.01" value={op.alertTarget||''} onChange={e=>onAlertChange(op.symbol,parseFloat(e.target.value)||0)} placeholder="SET" style={{width:'100%',background:'transparent',border:'none',outline:'none',fontSize:9,fontFamily:'monospace',fontWeight:900,color:'white'}}/>
                  </div>
                  {op.min!==undefined&&(
                    <div style={{display:'flex',justifyContent:'space-between',fontSize:8,fontFamily:'monospace',fontWeight:'bold',padding:'0 4px'}}>
                      <div><div style={{fontSize:6,color:'#3f3f46',textTransform:'uppercase'}}>Min</div><div style={{color:'#a1a1aa'}}>{op.min.toFixed(isBTCasset?4:2)}</div></div>
                      <div style={{textAlign:'right'}}><div style={{fontSize:6,color:'#3f3f46',textTransform:'uppercase'}}>Max</div><div style={{color:'#a1a1aa'}}>{op.max.toFixed(isBTCasset?4:2)}</div></div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── MAIN APP ──────────────────────────────────────────────────
export default function App() {
  const [marketData, setMarketData] = useState({});
  const [showBalance, setShowBalance] = useState(() => load('fdusd_show_balance', true));
  const [balances, setBalances] = useState(() => load('fdusd_balances', {}));
  const [entryPrices, setEntryPrices] = useState(() => load('fdusd_entry_prices', {}));
  const [strategyRef, setStrategyRef] = useState(() => load('fdusd_strategy_ref', null));
  const [strategyThreshold, setStrategyThreshold] = useState(() => load('fdusd_strategy_threshold', 0.5));
  const [isCycleActive, setIsCycleActive] = useState(() => load('fdusd_cycle_active', false));
  const [ratiosHistory, setRatiosHistory] = useState(() => load('fdusd_ratios_history', {}));
  const [unitAlerts, setUnitAlerts] = useState(() => load('fdusd_unit_alerts', {}));
  const [threshold, setThreshold] = useState(() => load('fdusd_threshold', 1.0));
  const [connStatus, setConnStatus] = useState('connecting');
  const [activeAlert, setActiveAlert] = useState('none');

  const balancesRef = useRef(balances);
  const unitAlertsRef = useRef(unitAlerts);
  const strategyRefCurrent = useRef(strategyRef);
  const strategyThresholdRef = useRef(strategyThreshold);
  const isCycleActiveRef = useRef(isCycleActive);
  const audioCtx = useRef(null);
  const wsRef = useRef(null);
  const lastSound = useRef(0);

  useEffect(()=>{balancesRef.current=balances;},[balances]);
  useEffect(()=>{unitAlertsRef.current=unitAlerts;},[unitAlerts]);
  useEffect(()=>{strategyRefCurrent.current=strategyRef;},[strategyRef]);
  useEffect(()=>{strategyThresholdRef.current=strategyThreshold;},[strategyThreshold]);
  useEffect(()=>{isCycleActiveRef.current=isCycleActive;},[isCycleActive]);

  useEffect(()=>{
    save('fdusd_balances',balances); save('fdusd_entry_prices',entryPrices);
    save('fdusd_ratios_history',ratiosHistory); save('fdusd_unit_alerts',unitAlerts);
    save('fdusd_threshold',threshold); save('fdusd_strategy_threshold',strategyThreshold);
    save('fdusd_show_balance',showBalance); save('fdusd_cycle_active',isCycleActive);
    if(strategyRef) save('fdusd_strategy_ref',strategyRef);
  },[balances,entryPrices,ratiosHistory,unitAlerts,threshold,strategyThreshold,showBalance,strategyRef,isCycleActive]);

  const updateHistory = (mkt) => {
    setRatiosHistory(prev=>{
      const next={...prev};
      SYMBOLS.forEach(base=>{
        if(!mkt[base]) return;
        if(!next[base]) next[base]={};
        SYMBOLS.forEach(tgt=>{
          if(base===tgt||!mkt[tgt]) return;
          const ratio=mkt[base].price/mkt[tgt].price;
          const h=next[base][tgt]||{min:ratio,max:ratio};
          next[base][tgt]={min:Math.min(h.min,ratio),max:Math.max(h.max,ratio)};
        });
      });
      return next;
    });
  };

  const playSound = useCallback(()=>{
    try{
      if(!audioCtx.current) audioCtx.current=new(window.AudioContext||window.webkitAudioContext)();
      const ctx=audioCtx.current;
      if(ctx.state==='suspended') ctx.resume();
      const now=ctx.currentTime;
      const osc=ctx.createOscillator(), gain=ctx.createGain();
      osc.type='sine'; osc.frequency.setValueAtTime(2200,now);
      gain.gain.setValueAtTime(0,now); gain.gain.linearRampToValueAtTime(0.4,now+0.01); gain.gain.exponentialRampToValueAtTime(0.001,now+0.3);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(now); osc.stop(now+0.4);
    }catch(e){}
  },[]);

  const checkAlerts = (mkt)=>{
    let alert='none';
    const eth=mkt['ethfdusd'],btc=mkt['btcfdusd'];
    const hasPos=(balancesRef.current['ethfdusd']||0)>0||(balancesRef.current['btcfdusd']||0)>0;
    if(eth&&btc&&strategyRefCurrent.current){
      const ratio=eth.price/btc.price, dev=(ratio/strategyRefCurrent.current)-1, abs=Math.abs(dev);
      const sig=strategyThresholdRef.current/100, neu=sig/2;
      if(!isCycleActiveRef.current&&abs>=sig) setIsCycleActive(true);
      else if(isCycleActiveRef.current&&abs<=neu){setStrategyRef(ratio);setIsCycleActive(false);playSound();}
      if(hasPos&&abs>=sig) alert='strategy';
    }
    if(alert==='none'){
      SYMBOLS.forEach(base=>{
        const bal=balancesRef.current[base]||0;
        if(bal<=0||!mkt[base]) return;
        const totalUsd=bal*mkt[base].price;
        const ba=unitAlertsRef.current[base]||{};
        SYMBOLS.forEach(tgt=>{
          if(base===tgt||!mkt[tgt]) return;
          const ta=ba[tgt];
          if(!ta||ta<=0) return;
          if((totalUsd/mkt[tgt].price)>=ta) alert='units';
        });
      });
    }
    setActiveAlert(alert);
    if(alert!=='none'){const now=Date.now();if(now-lastSound.current>10000){playSound();lastSound.current=now;}}
  };

  useEffect(()=>{
    const connect=()=>{
      setConnStatus('connecting');
      const streams=SYMBOLS.map(s=>`${s}@ticker`).join('/');
      const ws=new WebSocket(`wss://stream.binance.com:9443/ws/${streams}`);
      wsRef.current=ws;
      ws.onopen=()=>setConnStatus('connected');
      ws.onmessage=(e)=>{
        const msg=JSON.parse(e.data);
        if(!msg.s) return;
        const sym=msg.s.toLowerCase(), price=parseFloat(msg.c);
        setMarketData(prev=>{
          const next={...prev,[sym]:{symbol:sym,baseAsset:msg.s.replace('FDUSD',''),price,change24h:parseFloat(msg.p),changePercent24h:parseFloat(msg.P),high24h:parseFloat(msg.h),low24h:parseFloat(msg.l),volume:parseFloat(msg.v),lastUpdate:msg.E,trend:prev[sym]&&price>prev[sym].price?'up':prev[sym]&&price<prev[sym].price?'down':'neutral',entryPrice:entryPrices[sym]}};
          updateHistory(next); checkAlerts(next); return next;
        });
      };
      ws.onclose=()=>{setConnStatus('closed');setTimeout(connect,3000);};
    };
    connect();
    return ()=>wsRef.current?.close();
  },[entryPrices]);

  const totalPortfolio=SYMBOLS.reduce((a,s)=>a+((marketData[s]?.price||0)*(balances[s]||0)),0);

  const widgetData=[];
  SYMBOLS.forEach(base=>{
    const bal=balances[base]||0;
    if(bal>0&&marketData[base]){
      const ba=unitAlerts[base]||{};
      SYMBOLS.forEach(tgt=>{
        if(base!==tgt&&ba[tgt]>0&&marketData[tgt]){
          const h=ratiosHistory[base]?.[tgt];
          widgetData.push({id:`${base}-${tgt}`,baseAsset:marketData[base].baseAsset,targetAsset:marketData[tgt].baseAsset,currentUnits:bal*(marketData[base].price/marketData[tgt].price),targetUnits:ba[tgt],minUnits:h?bal*h.min:undefined,maxUnits:h?bal*h.max:undefined,price:marketData[base].price,trend:marketData[base].trend});
        }
      });
    }
  });

  return (
    <div style={{minHeight:'100vh',background:'#000',color:'white',padding:16,display:'flex',flexDirection:'column',alignItems:'center',fontFamily:'system-ui,sans-serif',userSelect:'none'}}
      onClick={()=>{if(audioCtx.current?.state==='suspended') audioCtx.current.resume();}}>
      <div style={{width:'100%',maxWidth:420,display:'flex',flexDirection:'column',gap:28}}>

        <header style={{display:'flex',justifyContent:'space-between',alignItems:'flex-end',paddingTop:16}}>
          <div>
            <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:4,flexWrap:'wrap'}}>
              <span style={{fontSize:10,fontWeight:900,color:'#52525b',textTransform:'uppercase',letterSpacing:'0.2em'}}>Portfolio Balance</span>
              <button onClick={e=>{e.stopPropagation();setShowBalance(v=>!v);}} style={{background:'none',border:'none',color:'#52525b',cursor:'pointer',fontSize:12,padding:0}}>{showBalance?'👁':'🙈'}</button>
              {activeAlert!=='none'&&(
                <div style={{display:'flex',alignItems:'center',gap:6,background:'rgba(239,68,68,0.2)',padding:'2px 8px',borderRadius:9999,border:'1px solid rgba(239,68,68,0.3)'}}>
                  <span style={{fontSize:8,fontWeight:900,color:'#f87171',textTransform:'uppercase'}}>🔔 {activeAlert==='strategy'?'BTC/ETH':'META'}</span>
                </div>
              )}
            </div>
            <div style={{fontSize:34,fontFamily:'monospace',fontWeight:900,letterSpacing:'-0.03em'}}>
              {showBalance?`$${totalPortfolio.toLocaleString(undefined,{minimumFractionDigits:2})}`:'***,***.**'}
            </div>
          </div>
          <div style={{display:'flex',flexDirection:'column',alignItems:'flex-end',gap:6,paddingBottom:4}}>
            <div style={{width:8,height:8,borderRadius:'50%',background:connStatus==='connected'?'#22c55e':'#ef4444',boxShadow:connStatus==='connected'?'0 0 8px #22c55e':undefined}}/>
            <span style={{fontSize:8,fontWeight:900,color:'#3f3f46',textTransform:'uppercase'}}>Live</span>
          </div>
        </header>

        {strategyRef&&marketData['ethfdusd']&&marketData['btcfdusd']&&(
          <StrategyWidget reference={strategyRef} currentRatio={marketData['ethfdusd'].price/marketData['btcfdusd'].price} isCycleActive={isCycleActive} threshold={strategyThreshold}/>
        )}

        {widgetData.length>0&&(
          <section>
            <h2 style={{fontSize:10,fontWeight:900,color:'#52525b',textTransform:'uppercase',letterSpacing:'0.2em',marginBottom:14}}>Monitoreo Activo</h2>
            <div style={{display:'flex',gap:20,overflowX:'auto',paddingBottom:20,scrollSnapType:'x mandatory'}}>
              {widgetData.map(w=><CryptoWidget key={w.id} {...w}/>)}
            </div>
          </section>
        )}

        <div style={{background:'rgba(24,24,27,0.4)',padding:20,borderRadius:28,border:'1px solid rgba(255,255,255,0.05)',display:'flex',flexDirection:'column',gap:20}}>
          <div>
            <div style={{display:'flex',justifyContent:'space-between',fontSize:10,fontWeight:900,color:'#52525b',textTransform:'uppercase',letterSpacing:'0.15em',marginBottom:8}}>
              <span>Umbral General Unidades</span><span style={{color:'#818cf8'}}>{threshold}%</span>
            </div>
            <input type="range" min="0.1" max="5.0" step="0.1" value={threshold} onChange={e=>setThreshold(parseFloat(e.target.value))} style={{width:'100%',accentColor:'#6366f1'}}/>
          </div>
          <div>
            <div style={{display:'flex',justifyContent:'space-between',fontSize:10,fontWeight:900,color:'#52525b',textTransform:'uppercase',letterSpacing:'0.15em',marginBottom:8}}>
              <span>Umbral Estrategia BTC/ETH</span><span style={{color:'#fb923c'}}>±{strategyThreshold}%</span>
            </div>
            <input type="range" min="0.1" max="2.0" step="0.05" value={strategyThreshold} onChange={e=>setStrategyThreshold(parseFloat(e.target.value))} style={{width:'100%',accentColor:'#f97316'}}/>
          </div>
          <button
            onClick={()=>{
              const np={};
              SYMBOLS.forEach(s=>{if(marketData[s]) np[s]=marketData[s].price;});
              setEntryPrices(np);
              const eth=marketData['ethfdusd']?.price,btc=marketData['btcfdusd']?.price;
              if(eth&&btc){setStrategyRef(eth/btc);setIsCycleActive(false);}
              playSound();
            }}
            style={{width:'100%',padding:'16px 0',background:'white',color:'black',borderRadius:14,fontWeight:900,fontSize:10,textTransform:'uppercase',letterSpacing:'0.2em',border:'none',cursor:'pointer'}}
          >Fijar Precios y Reset Estrategia</button>
        </div>

        <main style={{display:'flex',flexDirection:'column',gap:14,paddingBottom:80}}>
          {SYMBOLS.map(sym=>marketData[sym]&&(
            <CryptoCard key={sym} data={marketData[sym]} balance={balances[sym]||0}
              onBalanceChange={v=>setBalances(p=>({...p,[sym]:v}))}
              allMarketData={marketData} isUsingCustomRef={Object.keys(entryPrices).length>0}
              threshold={threshold} history={ratiosHistory[sym]||{}} alerts={unitAlerts[sym]||{}}
              onAlertChange={(tgt,v)=>setUnitAlerts(p=>({...p,[sym]:{...(p[sym]||{}),[tgt]:v}}))}
            />
          ))}
        </main>
      </div>
    </div>
  );
}
