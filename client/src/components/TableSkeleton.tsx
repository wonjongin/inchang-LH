import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { Skeleton } from "primereact/skeleton";


export default function TableSkeleton({cols}: {cols: string[]}) {
    const rows = Array.from({ length: 100 }, (_, index) => ({ id: index + 1 }))

    return (
        <div >
            <DataTable value={rows} tableStyle={{ minWidth: '50rem' }} size="small" showGridlines stripedRows>
                {cols.map((col) => (
                    <Column key={col} field={col} header={col} body={<Skeleton borderRadius="10px"/>} />
                ))}
            </DataTable>
        </div>
    )
}