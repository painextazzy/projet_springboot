// DashboardHome.jsx - Version stable
import React, { useState, useEffect, useCallback, useRef } from "react";
import { api } from "../../services/api";
import webSocketService from "../../services/websocketService";
import SkeletonDashboard from "./skeletons/SkeletonDashboard";

const DashboardHome = () => {
  const [initialLoading, setInitialLoading] = useState(true);
  const [stats, setStats] = useState({
    dailyRevenue: 0,
    averageTicket: 0,
    totalCustomers: 0,
    totalOrders: 0,
    occupancyRate: 0,
    dailyChange: 0,
    orderChange: 0,
  });
  const [commandes, setCommandes] = useState([]);
  const [menu, setMenu] = useState([]);
  const [tables, setTables] = useState([]);
  const [timeFilter, setTimeFilter] = useState("day");
  const [topProducts, setTopProducts] = useState([]);
  const [outOfStockProducts, setOutOfStockProducts] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [serviceMetrics, setServiceMetrics] = useState({
    currentServiceTime: 0,
    averageServiceTime: 0,
    activeOrders: 0,
  });

  // Données pour les graphiques
  const [hourlyData, setHourlyData] = useState([]);
  const [dailyData, setDailyData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
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
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const heures = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (mins === 0) {
      return `${heures} h`;
    }
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

  const calculateOccupancyRate = useCallback((tablesData) => {
    if (!tablesData || tablesData.length === 0) return 0;
    const occupiedStatuses = [
      "occupe",
      "occupée",
      "occupee",
      "occupied",
      "true",
      "1",
      "en cours",
      "utilisée",
      "prise",
      "OCCUPE",
      "OCCUPÉE",
      "OCCUPEE",
    ];
    const occupiedCount = tablesData.filter((table) => {
      const status = table.status?.toString().toLowerCase().trim();
      return occupiedStatuses.includes(status);
    }).length;
    return Math.round((occupiedCount / tablesData.length) * 100);
  }, []);

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
      ? Math.floor(
          (new Date(lastPaidOrder.dateCloture) -
            new Date(lastPaidOrder.dateOuverture)) /
            (1000 * 60),
        )
      : 0;

    const lastOrderByTable = {};
    closedOrders.forEach((cmd) => {
      const tableId = cmd.tableId;
      const cmdDate = new Date(cmd.dateCloture);
      if (
        !lastOrderByTable[tableId] ||
        cmdDate > new Date(lastOrderByTable[tableId].dateCloture)
      ) {
        lastOrderByTable[tableId] = cmd;
      }
    });

    const serviceTimes = Object.values(lastOrderByTable).map((cmd) => {
      const ouverture = new Date(cmd.dateOuverture);
      const cloture = new Date(cmd.dateCloture);
      return Math.floor((cloture - ouverture) / (1000 * 60));
    });

    const averageServiceTime =
      serviceTimes.length > 0
        ? Math.floor(
            serviceTimes.reduce((a, b) => a + b, 0) / serviceTimes.length,
          )
        : 0;

    const activeOrders = commandesData.filter(
      (cmd) => cmd.statut === "EN_COURS",
    ).length;

    setServiceMetrics({
      currentServiceTime: lastServiceTime,
      averageServiceTime: averageServiceTime,
      activeOrders,
    });

    const durationDistribution = [0, 0, 0, 0, 0];
    serviceTimes.forEach((duration) => {
      if (duration <= 15) durationDistribution[0]++;
      else if (duration <= 30) durationDistribution[1]++;
      else if (duration <= 45) durationDistribution[2]++;
      else if (duration <= 60) durationDistribution[3]++;
      else durationDistribution[4]++;
    });
    setOrderDurationData(durationDistribution);
  }, []);

  const calculateHourlyData = useCallback((commandesData) => {
    const hours = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22];
    const now = new Date();
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);

    const todayCommandes = commandesData.filter((cmd) => {
      const cmdDate = new Date(cmd.dateOuverture);
      return cmdDate >= todayStart;
    });

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

  const calculateDailyData = useCallback((commandesData) => {
    const days = ["LUN", "MAR", "MER", "JEU", "VEN", "SAM", "DIM"];
    const now = new Date();
    const startOfWeek = new Date(now);
    const dayOfWeek = now.getDay();
    const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    startOfWeek.setDate(now.getDate() - daysToMonday);
    startOfWeek.setHours(0, 0, 0, 0);

    const weekCommandes = commandesData.filter((cmd) => {
      const cmdDate = new Date(cmd.dateOuverture);
      return cmdDate >= startOfWeek;
    });

    const dayStats = {};
    days.forEach((_, index) => {
      dayStats[index] = { revenue: 0, count: 0 };
    });

    weekCommandes.forEach((commande) => {
      const cmdDate = new Date(commande.dateOuverture);
      const day = cmdDate.getDay();
      const adjustedDay = day === 0 ? 6 : day - 1;
      if (dayStats[adjustedDay]) {
        dayStats[adjustedDay].revenue += commande.total || 0;
        dayStats[adjustedDay].count++;
      }
    });

    const maxRevenue = Math.max(
      ...Object.values(dayStats).map((d) => d.revenue),
      1,
    );

    const data = days.map((day, index) => ({
      label: day,
      revenue: dayStats[index]?.revenue || 0,
      count: dayStats[index]?.count || 0,
      revenuePercent: ((dayStats[index]?.revenue || 0) / maxRevenue) * 100,
    }));
    setDailyData(data);
  }, []);

  const calculateMonthlyData = useCallback((commandesData) => {
    const months = [
      "JAN",
      "FÉV",
      "MAR",
      "AVR",
      "MAI",
      "JUN",
      "JUL",
      "AOU",
      "SEP",
      "OCT",
      "NOV",
      "DÉC",
    ];
    const now = new Date();
    const currentYear = now.getFullYear();

    const yearCommandes = commandesData.filter((cmd) => {
      const cmdDate = new Date(cmd.dateOuverture);
      return cmdDate.getFullYear() === currentYear;
    });

    const monthStats = {};
    months.forEach((_, index) => {
      monthStats[index] = { revenue: 0, count: 0 };
    });

    yearCommandes.forEach((commande) => {
      const cmdDate = new Date(commande.dateOuverture);
      const month = cmdDate.getMonth();
      if (monthStats[month]) {
        monthStats[month].revenue += commande.total || 0;
        monthStats[month].count++;
      }
    });

    const maxRevenue = Math.max(
      ...Object.values(monthStats).map((m) => m.revenue),
      1,
    );

    const data = months.map((month, index) => ({
      label: month,
      revenue: monthStats[index]?.revenue || 0,
      count: monthStats[index]?.count || 0,
      revenuePercent: ((monthStats[index]?.revenue || 0) / maxRevenue) * 100,
    }));
    setMonthlyData(data);
  }, []);

  const updateDashboardData = useCallback(async () => {
    try {
      const [commandesData, menuData, tablesData] = await Promise.all([
        api.getCommandes(),
        api.getMenu(),
        api.getTables(),
      ]);
      setCommandes(commandesData);
      setMenu(menuData);
      setTables(tablesData);

      const now = new Date();
      let filteredCommandes = [];
      let previousCommandes = [];

      if (timeFilter === "hour") {
        const currentHour = now.getHours();
        const hourStart = new Date(now);
        hourStart.setHours(currentHour, 0, 0, 0);
        const hourEnd = new Date(now);
        hourEnd.setHours(currentHour, 59, 59, 999);
        filteredCommandes = commandesData.filter((cmd) => {
          const cmdDate = new Date(cmd.dateOuverture);
          return cmdDate >= hourStart && cmdDate <= hourEnd;
        });
        const prevHourStart = new Date(now);
        prevHourStart.setHours(currentHour - 1, 0, 0, 0);
        const prevHourEnd = new Date(now);
        prevHourEnd.setHours(currentHour - 1, 59, 59, 999);
        previousCommandes = commandesData.filter((cmd) => {
          const cmdDate = new Date(cmd.dateOuverture);
          return cmdDate >= prevHourStart && cmdDate <= prevHourEnd;
        });
      } else if (timeFilter === "day") {
        const todayStart = new Date(now);
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date(now);
        todayEnd.setHours(23, 59, 59, 999);
        filteredCommandes = commandesData.filter((cmd) => {
          const cmdDate = new Date(cmd.dateOuverture);
          return cmdDate >= todayStart && cmdDate <= todayEnd;
        });
        const yesterdayStart = new Date(now);
        yesterdayStart.setDate(now.getDate() - 1);
        yesterdayStart.setHours(0, 0, 0, 0);
        const yesterdayEnd = new Date(now);
        yesterdayEnd.setDate(now.getDate() - 1);
        yesterdayEnd.setHours(23, 59, 59, 999);
        previousCommandes = commandesData.filter((cmd) => {
          const cmdDate = new Date(cmd.dateOuverture);
          return cmdDate >= yesterdayStart && cmdDate <= yesterdayEnd;
        });
      } else {
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
        filteredCommandes = commandesData.filter((cmd) => {
          const cmdDate = new Date(cmd.dateOuverture);
          return cmdDate >= startOfMonth && cmdDate <= endOfMonth;
        });
        const lastMonthStart = new Date(
          now.getFullYear(),
          now.getMonth() - 1,
          1,
        );
        const lastMonthEnd = new Date(
          now.getFullYear(),
          now.getMonth(),
          0,
          23,
          59,
          59,
          999,
        );
        previousCommandes = commandesData.filter((cmd) => {
          const cmdDate = new Date(cmd.dateOuverture);
          return cmdDate >= lastMonthStart && cmdDate <= lastMonthEnd;
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

      const prevPaidCommandes = previousCommandes.filter(
        (cmd) => cmd.statut === "PAYEE",
      );
      const prevRevenue = prevPaidCommandes.reduce(
        (sum, cmd) => sum + (cmd.total || 0),
        0,
      );
      const revenueChange =
        prevRevenue > 0
          ? ((totalRevenue - prevRevenue) / prevRevenue) * 100
          : 0;
      const orderChange =
        previousCommandes.length > 0
          ? ((filteredCommandes.length - previousCommandes.length) /
              previousCommandes.length) *
            100
          : 0;

      const occupancyRate = calculateOccupancyRate(tablesData);

      setStats({
        dailyRevenue: totalRevenue,
        averageTicket,
        totalCustomers: filteredCommandes.length,
        totalOrders: filteredCommandes.length,
        occupancyRate: occupancyRate,
        dailyChange: revenueChange,
        orderChange: orderChange,
      });

      const productSales = {};
      filteredCommandes.forEach((commande) => {
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

      setOutOfStockProducts(menuData.filter((item) => item.quantite === 0));
      setLowStockProducts(
        menuData.filter((item) => item.quantite > 0 && item.quantite < 5),
      );

      calculateServiceMetrics(commandesData);
      calculateHourlyData(commandesData);
      calculateDailyData(commandesData);
      calculateMonthlyData(commandesData);
    } catch (error) {
      console.error("Erreur mise à jour dashboard:", error);
    }
  }, [
    timeFilter,
    calculateHourlyData,
    calculateDailyData,
    calculateMonthlyData,
    calculateOccupancyRate,
    calculateServiceMetrics,
  ]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setInitialLoading(true);
      await updateDashboardData();
      setInitialLoading(false);
    };
    fetchDashboardData();
  }, [updateDashboardData]);

  useEffect(() => {
    webSocketService.connect();
    const unsubscribe = webSocketService.subscribe(() => {
      console.log("🔄 WebSocket: mise à jour dashboard");
      updateDashboardData();
    });
    return () => {
      unsubscribe();
      webSocketService.disconnect();
    };
  }, [updateDashboardData]);

  const getCurrentData = () => {
    if (timeFilter === "hour") return hourlyData;
    if (timeFilter === "day") return dailyData;
    return monthlyData;
  };

  const currentData = getCurrentData();
  const maxRevenue = Math.max(...currentData.map((d) => d.revenue), 1);

  if (initialLoading) {
    return <SkeletonDashboard timeFilter={timeFilter} />;
  }

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
              <div className="bg-white p-1 rounded-2xl flex items-center shadow-sm">
                <button
                  onClick={() => setTimeFilter("hour")}
                  className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${timeFilter === "hour" ? "bg-white text-primary shadow-md" : "text-secondary hover:text-on-surface"}`}
                >
                  Heure
                </button>
                <button
                  onClick={() => setTimeFilter("day")}
                  className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${timeFilter === "day" ? "bg-white text-primary shadow-md" : "text-secondary hover:text-on-surface"}`}
                >
                  Jour
                </button>
                <button
                  onClick={() => setTimeFilter("month")}
                  className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${timeFilter === "month" ? "bg-white text-primary shadow-md" : "text-secondary hover:text-on-surface"}`}
                >
                  Mois
                </button>
              </div>
            </div>
          </div>

          {/* Cartes Statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="p-6 rounded-2xl bg-gradient-to-br from-primary to-primary-container text-white">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-white/70 text-xs uppercase tracking-wider">
                    Chiffre d'Affaire
                  </p>
                  <p className="text-2xl font-bold mt-1">
                    {formatPrice(stats.dailyRevenue)}
                  </p>
                  <p
                    className={`text-xs mt-2 ${stats.dailyChange >= 0 ? "text-green-300" : "text-red-300"}`}
                  >
                    {stats.dailyChange >= 0 ? "+" : ""}
                    {stats.dailyChange.toFixed(1)}% vs préc.
                  </p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                  <span className="material-symbols-outlined">trending_up</span>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 text-white">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-white/70 text-xs uppercase tracking-wider">
                    Commandes
                  </p>
                  <p className="text-2xl font-bold mt-1">{stats.totalOrders}</p>
                  <p
                    className={`text-xs mt-2 ${stats.orderChange >= 0 ? "text-green-300" : "text-red-300"}`}
                  >
                    {stats.orderChange >= 0 ? "+" : ""}
                    {stats.orderChange.toFixed(1)}% vs préc.
                  </p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                  <span className="material-symbols-outlined">
                    receipt_long
                  </span>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-700 text-white">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-white/70 text-xs uppercase tracking-wider">
                    Ticket Moyen
                  </p>
                  <p className="text-2xl font-bold mt-1">
                    {formatPrice(stats.averageTicket)}
                  </p>
                  <p className="text-xs text-white/50 mt-2">par commande</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                  <span className="material-symbols-outlined">receipt</span>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-600 to-amber-700 text-white">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-white/70 text-xs uppercase tracking-wider">
                    Tables occupées
                  </p>
                  <p className="text-2xl font-bold mt-1">
                    {stats.occupancyRate}%
                  </p>
                  <p className="text-xs text-white/50 mt-2">
                    capacité actuelle
                  </p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                  <span className="material-symbols-outlined">
                    table_restaurant
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Service Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-600 text-white">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                  <span className="material-symbols-outlined">timer</span>
                </div>
                <div>
                  <p className="text-white/70 text-xs uppercase">
                    Temps de service (dernière commande)
                  </p>
                  <p className="text-3xl font-bold">
                    {formatDuration(serviceMetrics.currentServiceTime)}
                  </p>
                  <p className="text-white/60 text-xs mt-1">
                    Moyenne par table:{" "}
                    {formatDuration(serviceMetrics.averageServiceTime)}
                  </p>
                </div>
              </div>
              <div className="text-white/70 text-sm">
                Dernière commande (ouverture → clôture)
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-gradient-to-br from-rose-500 to-rose-600 text-white">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                  <span className="material-symbols-outlined">
                    pending_actions
                  </span>
                </div>
                <div>
                  <p className="text-white/70 text-xs uppercase">
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

          {/* Distribution des temps de service */}
          {orderDurationData.some((val) => val > 0) && (
            <div className="mb-8 p-6 rounded-2xl bg-white shadow-lg border border-outline-variant/10">
              <h4 className="text-lg font-bold font-headline text-on-surface mb-4">
                Distribution des temps de service (minutes)
              </h4>
              <div className="grid grid-cols-5 gap-3">
                {[
                  "0-15 min",
                  "15-30 min",
                  "30-45 min",
                  "45-60 min",
                  "60+ min",
                ].map((label, index) => {
                  const maxValue = Math.max(...orderDurationData, 1);
                  const height = Math.max(
                    20,
                    (orderDurationData[index] / maxValue) * 100,
                  );
                  return (
                    <div key={index} className="text-center">
                      <div className="h-28 flex items-end justify-center mb-2">
                        <div
                          className="w-full bg-primary rounded-t-lg transition-all"
                          style={{ height: `${height}%`, minHeight: "8px" }}
                        >
                          {orderDurationData[index] > 0 && (
                            <div className="text-center text-xs font-bold text-primary mt-1">
                              {orderDurationData[index]}
                            </div>
                          )}
                        </div>
                      </div>
                      <p className="text-[10px] text-secondary">{label}</p>
                    </div>
                  );
                })}
              </div>
              <div className="text-center text-[10px] text-secondary/70 mt-3">
                Nombre de commandes par tranche de temps de service
              </div>
            </div>
          )}

          {/* Graphique Courbe */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 p-6 rounded-2xl bg-white border">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h4 className="text-lg font-bold">
                    Évolution du Chiffre d'Affaires
                  </h4>
                  <p className="text-secondary text-xs mt-1">
                    par {getPeriodText().toLowerCase()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-primary"></div>
                  <span className="text-xs text-secondary">Revenus (Ar)</span>
                </div>
              </div>

              <div className="relative h-64">
                <svg
                  className="w-full h-full"
                  viewBox={`0 0 ${Math.max(currentData.length * 70, 600)} 250`}
                  preserveAspectRatio="xMidYMid meet"
                >
                  {[0, 25, 50, 75, 100].map((percent, idx) => (
                    <line
                      key={idx}
                      x1="40"
                      y1={230 - (percent / 100) * 200}
                      x2={Math.max(currentData.length * 70, 600) - 20}
                      y2={230 - (percent / 100) * 200}
                      stroke="#e5e7eb"
                      strokeWidth="1"
                      strokeDasharray="4"
                    />
                  ))}

                  <polyline
                    points={currentData
                      .map(
                        (item, idx) =>
                          `${idx * 70 + 60},${230 - (item.revenue / maxRevenue) * 200}`,
                      )
                      .join(" ")}
                    fill="none"
                    stroke="#00307d"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {currentData.map((item, idx) => {
                    const cx = idx * 70 + 60;
                    const cy = 230 - (item.revenue / maxRevenue) * 200;
                    return (
                      <g key={idx} className="group">
                        <circle
                          cx={cx}
                          cy={cy}
                          r="5"
                          fill="#00307d"
                          stroke="white"
                          strokeWidth="2"
                          className="cursor-pointer transition-all hover:r-7"
                        />
                        <rect
                          x={cx - 35}
                          y={cy - 28}
                          width="70"
                          height="22"
                          rx="4"
                          fill="#1f2937"
                          className="opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                        />
                        <text
                          x={cx}
                          y={cy - 15}
                          textAnchor="middle"
                          fill="white"
                          fontSize="9"
                          fontWeight="bold"
                          className="opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                        >
                          {formatCompactPrice(item.revenue)}
                        </text>
                      </g>
                    );
                  })}

                  <text
                    x="30"
                    y="35"
                    textAnchor="end"
                    fontSize="9"
                    fill="#9ca3af"
                  >
                    {formatCompactPrice(maxRevenue)}
                  </text>
                  <text
                    x="30"
                    y="85"
                    textAnchor="end"
                    fontSize="9"
                    fill="#9ca3af"
                  >
                    {formatCompactPrice(maxRevenue * 0.75)}
                  </text>
                  <text
                    x="30"
                    y="135"
                    textAnchor="end"
                    fontSize="9"
                    fill="#9ca3af"
                  >
                    {formatCompactPrice(maxRevenue * 0.5)}
                  </text>
                  <text
                    x="30"
                    y="185"
                    textAnchor="end"
                    fontSize="9"
                    fill="#9ca3af"
                  >
                    {formatCompactPrice(maxRevenue * 0.25)}
                  </text>
                  <text
                    x="30"
                    y="235"
                    textAnchor="end"
                    fontSize="9"
                    fill="#9ca3af"
                  >
                    0
                  </text>
                </svg>

                <div className="flex justify-between mt-2 text-[9px] text-secondary px-4">
                  {currentData.map((item, idx) => (
                    <div key={idx} className="text-center flex-1">
                      {item.label}
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-5 gap-2 mt-4 pt-3 border-t">
                {currentData.slice(-5).map((item, idx) => (
                  <div
                    key={idx}
                    className="text-center p-2 rounded-lg bg-white shadow-sm"
                  >
                    <p className="text-[9px] text-secondary">{item.label}</p>
                    <p className="text-xs font-bold text-primary">
                      {formatCompactPrice(item.revenue)}
                    </p>
                    <p className="text-[9px] text-gray-400">{item.count} cmd</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-gradient-to-br from-gray-900 to-gray-800 text-white">
              <h4 className="text-lg font-bold mb-6">Performance de Pointe</h4>
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                    <span className="material-symbols-outlined">schedule</span>
                  </div>
                  <div>
                    <p className="text-white/50 text-[9px] uppercase">
                      Pic d'activité
                    </p>
                    <p className="text-xl font-bold">
                      {currentData.reduce(
                        (max, item) =>
                          item.revenue > max.revenue ? item : max,
                        currentData[0],
                      )?.label || "-"}
                    </p>
                    <p className="text-white/40 text-[8px] mt-0.5">
                      {formatPrice(
                        currentData.reduce(
                          (max, item) =>
                            item.revenue > max.revenue ? item : max,
                          currentData[0],
                        )?.revenue || 0,
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                    <span className="material-symbols-outlined">groups</span>
                  </div>
                  <div>
                    <p className="text-white/50 text-[9px] uppercase">
                      Affluence max
                    </p>
                    <p className="text-xl font-bold">
                      {currentData.reduce(
                        (max, item) => (item.count > max.count ? item : max),
                        currentData[0],
                      )?.count || 0}
                    </p>
                    <p className="text-white/40 text-[8px] mt-0.5">commandes</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Menu Performance */}
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
            {topProducts[0] && (
              <div className="lg:col-span-1 p-6 rounded-2xl bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20">
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2 py-0.5 rounded-full bg-primary text-white text-[8px] font-bold uppercase">
                    TOP VENTE
                  </span>
                  <span className="material-symbols-outlined text-primary text-xl">
                    emoji_events
                  </span>
                </div>
                <h4 className="text-base font-bold mb-1 line-clamp-2">
                  {topProducts[0].name}
                </h4>
                <p className="text-secondary text-xs">
                  Vendu {topProducts[0].quantity} fois
                </p>
                <div className="mt-3 pt-3 border-t border-primary/20">
                  <div className="text-lg font-bold text-primary">
                    {formatPrice(
                      topProducts[0].revenue / topProducts[0].quantity,
                    )}
                  </div>
                  <p className="text-[8px] text-secondary uppercase">
                    Prix unitaire
                  </p>
                </div>
              </div>
            )}

            <div className="lg:col-span-3 p-6 rounded-2xl bg-white border">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-lg font-bold">Classement des Produits</h4>
                <span className="text-[9px] text-secondary">
                  Par volume de ventes
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-secondary text-[9px] font-bold uppercase border-b">
                      <th className="pb-2 text-left">#</th>
                      <th className="pb-2 text-left">Produit</th>
                      <th className="pb-2 text-left">Volume</th>
                      <th className="pb-2 text-left">Revenu</th>
                      <th className="pb-2 text-left">Performance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topProducts.map((product, idx) => (
                      <tr key={idx} className="border-b border-gray-50">
                        <td className="py-3 text-center font-bold text-primary w-8">
                          {idx + 1}
                        </td>
                        <td className="py-3 font-medium">{product.name}</td>
                        <td className="py-3">{product.quantity} unités</td>
                        <td className="py-3">
                          {formatCompactPrice(product.revenue)}
                        </td>
                        <td className="py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-20 h-1 bg-white rounded-full overflow-hidden shadow-inner">
                              <div
                                className="h-full bg-primary rounded-full"
                                style={{
                                  width: `${Math.min(100, (product.quantity / topProducts[0].quantity) * 100)}%`,
                                }}
                              ></div>
                            </div>
                            <span className="text-[9px] text-secondary">
                              {Math.round(
                                (product.quantity / topProducts[0].quantity) *
                                  100,
                              )}
                              %
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Stock Status */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 rounded-2xl bg-gradient-to-br from-orange-50 to-red-50 border border-orange-200">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1.5 rounded-lg bg-orange-100 text-orange-600">
                  <span className="material-symbols-outlined text-base">
                    warning
                  </span>
                </div>
                <h4 className="text-base font-bold">Menu Épuisé</h4>
                <span className="text-xs font-bold text-orange-600 bg-orange-100 px-2 py-0.5 rounded-full ml-auto">
                  {outOfStockProducts.length}
                </span>
              </div>
              <div className="space-y-1 max-h-36 overflow-y-auto">
                {outOfStockProducts.length > 0 ? (
                  outOfStockProducts.slice(0, 4).map((product) => (
                    <div
                      key={product.id}
                      className="flex justify-between items-center p-2 bg-white rounded-lg shadow-sm"
                    >
                      <span className="text-sm font-medium">{product.nom}</span>
                      <span className="text-[10px] text-red-500 font-semibold bg-red-50 px-2 py-0.5 rounded-full">
                        Épuisé
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-secondary text-sm">
                    Aucun produit épuisé
                  </div>
                )}
              </div>
            </div>

            {lowStockProducts.length > 0 && (
              <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-200">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-1.5 rounded-lg bg-amber-100 text-amber-600">
                    <span className="material-symbols-outlined text-base">
                      inventory
                    </span>
                  </div>
                  <h4 className="text-base font-bold">Stock Faible</h4>
                  <span className="text-xs font-bold text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full ml-auto">
                    {lowStockProducts.length}
                  </span>
                </div>
                <div className="space-y-1 max-h-36 overflow-y-auto">
                  {lowStockProducts.slice(0, 4).map((product) => (
                    <div
                      key={product.id}
                      className="flex justify-between items-center p-2 bg-white rounded-lg shadow-sm"
                    >
                      <span className="text-sm font-medium">{product.nom}</span>
                      <span className="text-[10px] text-amber-600 font-semibold bg-amber-50 px-2 py-0.5 rounded-full">
                        Stock: {product.quantite}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default DashboardHome;
