import { getAllOrdersAction } from "@/actions/admin-orders";
import OrdersTable from "./OrdersTable";

export const metadata = { title: "Orders — Admin" };

export default async function AdminOrdersPage() {
  const { orders } = await getAllOrdersAction();

  return (
    <div>
      <div style={{ marginBottom: "28px" }}>
        <h1
          style={{
            fontSize: "1.6rem",
            fontWeight: 700,
            color: "#1a0a0e",
            fontFamily: "var(--font-playfair)",
            margin: 0,
          }}
        >
          Orders
        </h1>
        <p style={{ color: "#7a5c4a", fontSize: "0.875rem", marginTop: "6px" }}>
          {orders.length} total order{orders.length !== 1 ? "s" : ""}
        </p>
      </div>
      <OrdersTable orders={orders} />
    </div>
  );
}