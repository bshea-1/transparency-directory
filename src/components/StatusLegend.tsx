import { AlertCircle, CheckCircle2 } from "lucide-react";

export function StatusLegend() {
  return (
    <div className="status-guide flock-reveal">
      <p className="status-guide__title">How to read the directory</p>
      <div className="status-guide__items">
        <div>
          <span className="status-chip status-chip--verified"><CheckCircle2 size={14} /> Verified report</span>
          <p>Opens the published transparency page directly.</p>
        </div>
        <div>
          <span className="status-chip status-chip--missing"><AlertCircle size={14} /> No verified report</span>
          <p>No verified public report was found for that jurisdiction.</p>
        </div>
      </div>
    </div>
  );
}
