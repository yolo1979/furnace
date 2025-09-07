export default function TallyPopout() {
  return (
    <div style={{
      fontFamily: '-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica,Arial,sans-serif',
      background:'#f5f5f7', color:'#1d1d1f', margin:0, padding:12
    }}>
      <h3 style={{margin:'4px 0 10px'}}>🔥 Live Tally</h3>
      <div id="stats" style={{
        background:'#fff', border:'1px solid #e5e5ea', borderRadius:12, padding:12,
        boxShadow:'0 1px 3px rgba(0,0,0,.06)'
      }}>
        <div id="rows" style={{fontSize:14, lineHeight:1.6}}>
          <div>Burned: <b id="burned">$0.00</b></div>
          <div>Remaining: <b id="remaining">$0.00</b></div>
          <div>Budget: <b id="budget">$0.00</b></div>
          <div>Balance: <b id="balance">$0.00</b></div>
        </div>
      </div>

      <div style={{fontSize:12, color:'#6e6e73', marginTop:12}}>Recent steps</div>
      <div id="log" style={{
        background:'#fff', border:'1px solid #e5e5ea', borderRadius:12, padding:8,
        boxShadow:'0 1px 3px rgba(0,0,0,.06)', maxHeight:260, overflow:'auto'
      }}></div>

      <script dangerouslySetInnerHTML={{__html: `
        const $$ = (n) => '$' + (Number(n||0)).toFixed(2);

        function render(p){
          if(!p) return;
          document.getElementById('burned').textContent   = $$((p.burned));
          document.getElementById('remaining').textContent = $$((p.remaining));
          document.getElementById('budget').textContent    = $$((p.budget));
          document.getElementById('balance').textContent   = $$((p.balance));

          const log = document.getElementById('log');
          log.innerHTML = '';
          (p.results||[]).forEach(r=>{
            const row = document.createElement('div');
            row.style.display='grid';
            row.style.gridTemplateColumns='1fr auto';
            row.style.gap='4px';
            row.style.padding='6px 0';
            row.style.borderBottom='1px solid #f0f0f0';
            row.innerHTML = '<div>#'+r.i+' • '+r.ts+'<div style="color:#6e6e73;font-size:12px">'+r.info+'</div></div>'
              + '<div style="font-weight:600">'+$$((r.cost))+'</div>';
            log.appendChild(row);
          });
        }

        // BroadcastChannel (preferred)
        let chan = null;
        try {
          chan = new BroadcastChannel('furnace-tally');
          chan.onmessage = (ev) => render(ev.data);
        } catch {}

        // Fallback polling from localStorage
        function pull(){
          try {
            const raw = localStorage.getItem('furnace:tally');
            if(raw){ render(JSON.parse(raw)); }
          } catch {}
        }
        pull();
        setInterval(pull, 1500);
      `}} />
    </div>
  );
}