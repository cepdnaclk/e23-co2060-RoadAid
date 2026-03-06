export default function Modal({ open, title, children, onClose }) {
  if (!open) return null;
  return (
    <div style={{
      position:"fixed", inset:0, background:"rgba(0,0,0,0.35)",
      display:"flex", alignItems:"center", justifyContent:"center", padding:16, zIndex:9999
    }}>
      <div style={{
        width:"100%", maxWidth:520, background:"#fff", borderRadius:16,
        border:"1px solid rgba(17,24,39,0.12)", boxShadow:"0 20px 60px rgba(0,0,0,0.25)"
      }}>
        <div style={{ padding:16, borderBottom:"1px solid rgba(17,24,39,0.08)", display:"flex", justifyContent:"space-between" }}>
          <b>{title}</b>
          <button className="btn" onClick={onClose}>Close</button>
        </div>
        <div style={{ padding:16 }}>{children}</div>
      </div>
    </div>
  );
}