import { title } from "@/components/primitives";
import Table from "@/components/table";

export default function ClientesPage() {
  return (
    <div>
      <h1 className={title()}>clientes</h1>
      <Table/>
    </div>
  );
}
