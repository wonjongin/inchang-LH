import { ProgressSpinner } from "primereact/progressspinner";

export default function Loading() {
    return (
        <div>
            <ProgressSpinner style={{ width: '50px', height: '50px' }} strokeWidth="8" fill="var(--surface-ground)" animationDuration=".5s" />
        </div>
    )
}