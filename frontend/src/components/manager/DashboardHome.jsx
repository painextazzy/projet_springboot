import React, { useState, useEffect, useCallback } from "react";
import { api } from "../../services/api";
import SkeletonDashboard from "./SkeletonDashboard";

const DashboardHome = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    dailyRevenue: 0,
    averageTicket: 0,
    totalCustomers: 0,
    occupancyRate: 0,
    dailyChange: 0,
  });
  const [commandes, setCommandes] = useState([]);
  const [menu, setMenu] = useState([]);
  const [tables, setTables] = useState([]);
  const [timeFilter, setTimeFilter] = useState("day");
  const [topProducts, setTopProducts] = useState([]);
  const [outOfStockProducts, setOutOfStockProducts] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [peakHour, setPeakHour] = useState({ hour: "", count: 0, revenue: 0 });
  const [hourlyData, setHourlyData] = useState([]);
  const [dailyData, setDailyData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [serviceMetrics, setServiceMetrics] = useState({
    currentServiceTime: 0,
    activeOrders: 0,
  });
  const [orderDurationData, setOrderDurationData] = useState([0, 0, 0, 0, 0]);

  const getDateRangeText = useCallback(() => {
    const now = new Date();
    if (timeFilter === "hour") {
      return `Heure actuelle, ${now.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}`;
    } else if (timeFilter === "day") {
      return `Aujourd'hui, ${now.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}`;
    } else {
      return now.toLocaleDateString("fr-FR", {
        month: "long",
        year: "numeric",
      });
    }
  }, [timeFilter]);

  const getPeriodText = useCallback(() => {
    if (timeFilter === "hour") return "Heure";
    if (timeFilter === "day") return "Jour";
    return "Mois";
  }, [timeFilter]);

  const formatDuration = useCallback((minutes) => {
    if (minutes < 60) return `${minutes} min`;
    const heures = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (mins === 0) return `${heures} h`;
    return `${heures} h ${mins} min`;
  }, []);

  const formatPrice = useCallback((price) => {
    return (
      new Intl.NumberFormat("fr-MG").format(price || 0).replace(/\s/g, "") +
      " Ar"
    );
  }, []);

  const formatCompactPrice = useCallback((price) => {
    if (price >= 1000000) return (price / 1000000).toFixed(1) + "M Ar";
    if (price >= 1000) return (price / 1000).toFixed(0) + "k Ar";
    return price + " Ar";
  }, []);

  // Calcul des statistiques
  const calculateStats = useCallback(
    (commandesData) => {
      const now = new Date();
      const todayStart = new Date(now);
      todayStart.setHours(0, 0, 0, 0);
      const todayEnd = new Date(now);
      todayEnd.setHours(23, 59, 59, 999);

      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        0,
        23,
        59,
        59,
        999,
      );

      let filteredCommandes = [];
      if (timeFilter === "day") {
        filteredCommandes = commandesData.filter((cmd) => {
          const cmdDate = new Date(cmd.dateOuverture);
          return cmdDate >= todayStart && cmdDate <= todayEnd;
        });
      } else {
        filteredCommandes = commandesData.filter((cmd) => {
          const cmdDate = new Date(cmd.dateOuverture);
          return cmdDate >= startOfMonth && cmdDate <= endOfMonth;
        });
      }

      const paidCommandes = filteredCommandes.filter(
        (cmd) => cmd.statut === "PAYEE",
      );
      const totalRevenue = paidCommandes.reduce(
        (sum, cmd) => sum + (cmd.total || 0),
        0,
      );
      const averageTicket =
        paidCommandes.length > 0 ? totalRevenue / paidCommandes.length : 0;
      const totalCustomers = filteredCommandes.length;

      const tablesOccupees = tables.filter(
        (table) => table.status && table.status.toUpperCase() === "OCCUPE",
      ).length;
      const occupancyRate =
        tables.length > 0
          ? Math.round((tablesOccupees / tables.length) * 100)
          : 0;

      setStats({
        dailyRevenue: totalRevenue,
        averageTicket,
        totalCustomers,
        occupancyRate,
        dailyChange: 12.5,
      });
    },
    [timeFilter, tables],
  );

  // Calcul des tops produits
  const calculateTopProducts = useCallback((commandesData) => {
    const productSales = {};
    commandesData.forEach((commande) => {
      if (commande.lignes && commande.lignes.length > 0) {
        commande.lignes.forEach((ligne) => {
          const productName = ligne.platNom || `Produit ${ligne.platId}`;
          if (!productSales[productName]) {
            productSales[productName] = {
              name: productName,
              quantity: 0,
              revenue: 0,
            };
          }
          productSales[productName].quantity += ligne.quantite;
          productSales[productName].revenue += ligne.total;
        });
      }
    });
    const top5 = Object.values(productSales)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 4);
    setTopProducts(top5);
  }, []);

  // Calcul des stocks
  const calculateStockStatus = useCallback((menuData) => {
    const outOfStock = menuData.filter((item) => item.quantite === 0);
    const lowStock = menuData.filter(
      (item) => item.quantite > 0 && item.quantite < 5,
    );
    setOutOfStockProducts(outOfStock);
    setLowStockProducts(lowStock);
  }, []);

  // Calcul des métriques de service
  const calculateServiceMetrics = useCallback((commandesData) => {
    const closedOrders = commandesData.filter(
      (cmd) => cmd.statut === "PAYEE" && cmd.dateCloture,
    );
    const lastPaidOrder =
      closedOrders.length > 0
        ? closedOrders.sort(
            (a, b) => new Date(b.dateCloture) - new Date(a.dateCloture),
          )[0]
        : null;
    const lastServiceTime = lastPaidOrder
      ? (new Date(lastPaidOrder.dateCloture) -
          new Date(lastPaidOrder.dateOuverture)) /
        (1000 * 60)
      : 0;
    const activeOrders = commandesData.filter(
      (cmd) => cmd.statut === "EN_COURS",
    ).length;
    setServiceMetrics({ currentServiceTime: lastServiceTime, activeOrders });
  }, []);

  // Données horaires
  const calculateHourlyData = useCallback((commandesData) => {
    const hours = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22];
    const now = new Date();
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);
    const todayCommandes = commandesData.filter(
      (cmd) => new Date(cmd.dateOuverture) >= todayStart,
    );
    const hourStats = {};
    todayCommandes.forEach((commande) => {
      const hour = new Date(commande.dateOuverture).getHours();
      if (!hourStats[hour]) hourStats[hour] = { revenue: 0, count: 0 };
      hourStats[hour].revenue += commande.total || 0;
      hourStats[hour].count++;
    });
    const maxRevenue = Math.max(
      ...hours.map((h) => hourStats[h]?.revenue || 0),
      1,
    );
    const data = hours.map((hour) => ({
      label: `${hour}:00`,
      revenue: hourStats[hour]?.revenue || 0,
      count: hourStats[hour]?.count || 0,
      revenuePercent: ((hourStats[hour]?.revenue || 0) / maxRevenue) * 100,
    }));
    setHourlyData(data);
  }, []);

  // Chargement des données
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const [commandesData, menuData, tablesData] = await Promise.all([
          api.getCommandes(),
          api.getMenu(),
          api.getTables(),
        ]);
        setCommandes(commandesData);
        setMenu(menuData);
        setTables(tablesData);
        calculateStats(commandesData);
        calculateTopProducts(commandesData);
        calculateStockStatus(menuData);
        calculateServiceMetrics(commandesData);
        calculateHourlyData(commandesData);
      } catch (error) {
        console.error("Erreur chargement dashboard:", error);
      } finally {
        setTimeout(() => setLoading(false), 500);
      }
    };
    fetchDashboardData();
  }, [
    timeFilter,
    calculateStats,
    calculateTopProducts,
    calculateStockStatus,
    calculateServiceMetrics,
    calculateHourlyData,
  ]);

  // ✅ Afficher le skeleton pendant le chargement
  if (loading) {
    return <SkeletonDashboard timeFilter={timeFilter} />;
  }

  const currentData = timeFilter === "hour" ? hourlyData : dailyData;

  return (
    <div className="bg-background font-body text-on-surface antialiased">
      <main className="min-h-screen">
        <section className="py-12 px-8 max-w-[1600px] mx-auto">
          {/* Header */}
          <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h2 className="text-3xl font-bold font-headline text-on-surface tracking-tight mb-2">
                Tableau de Bord Analytique
              </h2>
              <p className="text-secondary font-body">
                Performance détaillée du restaurant —{" "}
                <span className="text-primary font-medium">
                  {getDateRangeText()}
                </span>
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <div className="bg-surface-container-high p-1 rounded-2xl flex items-center">
                <button
                  onClick={() => setTimeFilter("hour")}
                  className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${timeFilter === "hour" ? "bg-surface-container-lowest text-primary shadow-sm" : "text-secondary hover:text-on-surface"}`}
                >
                  Heure
                </button>
                <button
                  onClick={() => setTimeFilter("day")}
                  className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${timeFilter === "day" ? "bg-surface-container-lowest text-primary shadow-sm" : "text-secondary hover:text-on-surface"}`}
                >
                  Jour
                </button>
                <button
                  onClick={() => setTimeFilter("month")}
                  className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${timeFilter === "month" ? "bg-surface-container-lowest text-primary shadow-sm" : "text-secondary hover:text-on-surface"}`}
                >
                  Mois
                </button>
              </div>
            </div>
          </div>

          {/* Cartes Statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="col-span-1 md:col-span-2 p-8 rounded-[2rem] bg-gradient-to-br from-primary to-primary-container text-white">
              <div className="relative z-10">
                <span className="px-4 py-1 rounded-full bg-white/20 text-[10px] font-bold uppercase">
                  Chiffre d'Affaire ({getPeriodText()})
                </span>
                <h3 className="text-5xl font-extrabold mt-4 mb-1">
                  {formatPrice(stats.dailyRevenue)}
                </h3>
                <p className="text-white/70 text-sm">
                  +{stats.dailyChange}% vs période précédente
                </p>
              </div>
            </div>

            <div className="p-8 rounded-[2rem] bg-surface-container-lowest border">
              <div className="w-12 h-12 rounded-2xl bg-secondary-fixed flex items-center justify-center text-primary mb-6">
                <span className="material-symbols-outlined">receipt_long</span>
              </div>
              <p className="text-secondary text-xs font-bold uppercase mb-1">
                Ticket Moyen
              </p>
              <h3 className="text-3xl font-bold">
                {formatPrice(stats.averageTicket)}
              </h3>
            </div>

            <div className="p-8 rounded-[2rem] bg-surface-container-lowest border">
              <div className="w-12 h-12 rounded-2xl bg-tertiary-fixed flex items-center justify-center text-tertiary mb-6">
                <span className="material-symbols-outlined">person_add</span>
              </div>
              <p className="text-secondary text-xs font-bold uppercase mb-1">
                Couverts ({getPeriodText()})
              </p>
              <h3 className="text-3xl font-bold">{stats.totalCustomers}</h3>
              <div className="text-xs mt-2">
                Taux occupation: {stats.occupancyRate}%
              </div>
            </div>
          </div>

          {/* Service Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="p-6 rounded-[2rem] bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                  <span className="material-symbols-outlined">timer</span>
                </div>
                <div>
                  <p className="text-white/80 text-xs uppercase">
                    Temps de service
                  </p>
                  <p className="text-3xl font-bold">
                    {formatDuration(serviceMetrics.currentServiceTime)}
                  </p>
                </div>
              </div>
              <div className="text-white/70 text-sm">
                Dernière commande (ouverture → clôture)
              </div>
            </div>

            <div className="p-6 rounded-[2rem] bg-gradient-to-br from-orange-500 to-orange-600 text-white">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                  <span className="material-symbols-outlined">
                    pending_actions
                  </span>
                </div>
                <div>
                  <p className="text-white/80 text-xs uppercase">
                    Commandes en attente
                  </p>
                  <p className="text-3xl font-bold">
                    {serviceMetrics.activeOrders}
                  </p>
                </div>
              </div>
              <div className="text-white/70 text-sm">
                En attente de paiement
              </div>
            </div>
          </div>

          {/* Graphique */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 p-8 rounded-[2rem] bg-surface-container-lowest border">
              <h4 className="text-xl font-bold mb-6">
                Flux {getPeriodText()} Détaillé
              </h4>
              <div className="flex items-end justify-between h-64 gap-2">
                {currentData.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col items-center gap-2 w-full"
                  >
                    <div
                      className="w-3 bg-primary rounded-t-sm transition-all"
                      style={{
                        height: `${Math.max(15, item.revenuePercent)}%`,
                      }}
                    ></div>
                    <span className="text-[10px] text-secondary">
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-8 rounded-[2rem] bg-on-surface text-white">
              <h4 className="text-xl font-bold mb-6">Performance de Pointe</h4>
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
                    <span className="material-symbols-outlined">schedule</span>
                  </div>
                  <div>
                    <p className="text-white/60 text-[10px] uppercase">
                      Heure de Pointe
                    </p>
                    <p className="text-xl font-bold">12:00 - 14:00</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
                    <span className="material-symbols-outlined">group</span>
                  </div>
                  <div>
                    <p className="text-white/60 text-[10px] uppercase">
                      Affluence Max
                    </p>
                    <p className="text-xl font-bold">45 Clients</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Menu Performance */}
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
            {topProducts[0] && (
              <div className="lg:col-span-1 p-8 rounded-[2rem] bg-surface-container-highest">
                <span className="px-3 py-1 rounded-full bg-primary text-white text-[9px] font-bold uppercase mb-4 inline-block">
                  Top Ventes
                </span>
                <h4 className="text-2xl font-bold mb-2">
                  {topProducts[0].name}
                </h4>
                <p className="text-secondary text-sm">
                  Vendu {topProducts[0].quantity} fois
                </p>
                <div className="mt-4 text-3xl font-bold text-primary">
                  {formatPrice(
                    topProducts[0].revenue / topProducts[0].quantity,
                  )}
                </div>
              </div>
            )}

            <div className="lg:col-span-3 p-8 rounded-[2rem] bg-surface-container-lowest border">
              <h4 className="text-xl font-bold mb-6">Menu Performance</h4>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-secondary text-[11px] font-bold uppercase border-b">
                      <th className="pb-4 text-left">Produit</th>
                      <th className="pb-4 text-left">Volume</th>
                      <th className="pb-4 text-left">Revenu</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topProducts.map((product, idx) => (
                      <tr key={idx} className="border-b">
                        <td className="py-4 font-semibold">{product.name}</td>
                        <td className="py-4">{product.quantity}</td>
                        <td className="py-4 font-medium">
                          {formatCompactPrice(product.revenue)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Stock Status */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-6 rounded-[2rem] bg-gradient-to-br from-orange-50 to-red-50 border border-orange-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-xl bg-orange-100 text-orange-600">
                  <span className="material-symbols-outlined">warning</span>
                </div>
                <h4 className="text-lg font-bold">Menu Épuisé</h4>
                <span className="text-xs font-bold text-orange-600 bg-orange-100 px-3 py-1 rounded-full ml-auto">
                  {outOfStockProducts.length}
                </span>
              </div>
              {outOfStockProducts.slice(0, 5).map((product) => (
                <div
                  key={product.id}
                  className="flex justify-between items-center p-2 bg-white/60 rounded-lg mb-2"
                >
                  <span className="text-sm font-medium">{product.nom}</span>
                  <span className="text-xs text-red-500 font-semibold">
                    Épuisé
                  </span>
                </div>
              ))}
            </div>

            {lowStockProducts.length > 0 && (
              <div className="p-6 rounded-[2rem] bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-xl bg-amber-100 text-amber-600">
                    <span className="material-symbols-outlined">inventory</span>
                  </div>
                  <h4 className="text-lg font-bold">Stock Faible</h4>
                  <span className="text-xs font-bold text-amber-600 bg-amber-100 px-3 py-1 rounded-full ml-auto">
                    {lowStockProducts.length}
                  </span>
                </div>
                {lowStockProducts.slice(0, 5).map((product) => (
                  <div
                    key={product.id}
                    className="flex justify-between items-center p-2 bg-white/60 rounded-lg mb-2"
                  >
                    <span className="text-sm font-medium">{product.nom}</span>
                    <span className="text-xs text-amber-600 font-semibold">
                      Stock: {product.quantite}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default DashboardHome;
