import React from "react";
import SkipLink from "./components/SkipLink.jsx";
import Header from "./components/Header.jsx";
import Hero from "./components/Hero.jsx";
import Products from "./components/Products.jsx";
import Stats from "./components/Stats.jsx";
import Story from "./components/Story.jsx";
import Delivery from "./components/Delivery.jsx";
import Visit from "./components/Visit.jsx";
import Footer from "./components/Footer.jsx";
import MobileBar from "./components/MobileBar.jsx";
import Summary from "./components/Summary.jsx";
import { useOrder } from "./hooks/useOrder.js";
import { useReveal } from "./hooks/useReveal.js";

/* Phase B: the interaction port. Order state lives once, here; the section
 * components receive it (or their own hooks) and the `role=status` announcer
 * carries the bulk-threshold message. */
export default function App() {
  const order = useOrder();
  useReveal();

  return (
    <>
      <SkipLink />
      <Header />
      <main id="main">
        <Hero />
        <Products order={order} />
        <Stats />
        <Story />
        <Delivery />
        <Visit />
      </main>
      <Footer />
      <MobileBar href={order.href} />
      <Summary order={order} />
      <p className="sr-only" role="status" aria-live="polite" data-order-announce="">
        {order.announcement}
      </p>
    </>
  );
}
