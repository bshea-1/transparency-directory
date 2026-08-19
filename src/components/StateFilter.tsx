import { US_STATES } from "../data/states";

interface StateFilterProps {
  selectedState: string;
  onStateChange: (stateCode: string) => void;
}

export function StateFilter({ selectedState, onStateChange }: StateFilterProps) {
  return (
    <div className="field-group">
      <label htmlFor="state-filter-select">State or district</label>
      <select
        id="state-filter-select"
        value={selectedState}
        onChange={(event) => onStateChange(event.target.value)}
        aria-label="Filter directory by state"
      >
        <option value="ALL">All states and DC</option>
        {US_STATES.map((state) => (
          <option key={state.code} value={state.code}>
            {state.name} ({state.code})
          </option>
        ))}
      </select>
    </div>
  );
}
