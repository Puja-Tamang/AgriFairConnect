import React, { useState } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { TrendingUp, TrendingDown, MapPin, Calendar } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useLanguage } from '../../context/LanguageContext';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const MarketDashboard: React.FC = () => {
  const { marketPrices } = useData();
  const { t } = useLanguage();
  const [selectedLocation, setSelectedLocation] = useState('सबै स्थान');
  const [selectedCrop, setSelectedCrop] = useState('सबै बाली');

  // Get unique locations and crops
  const locations = [t('market.allLocations'), ...Array.from(new Set(marketPrices.map(p => p.location)))];
  const crops = [t('market.allCrops'), ...Array.from(new Set(marketPrices.map(p => p.cropName)))];

  // Filter prices
  const filteredPrices = marketPrices.filter(price => {
    const locationMatch = selectedLocation === t('market.allLocations') || price.location === selectedLocation;
    const cropMatch = selectedCrop === t('market.allCrops') || price.cropName === selectedCrop;
    return locationMatch && cropMatch;
  });

  // Mock historical data for charts
  const generateHistoricalData = (currentPrice: number) => {
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const variation = (Math.random() - 0.5) * 0.2;
      data.push(Math.round(currentPrice * (1 + variation)));
    }
    return data;
  };

  const chartLabels = ['6 दिन अगाडि', '5 दिन अगाडि', '4 दिन अगाडि', '3 दिन अगाडि', '2 दिन अगाडि', 'हिजो', 'आज'];

  // Price trend chart data
  const priceChartData = {
    labels: chartLabels,
    datasets: filteredPrices.slice(0, 3).map((price, index) => {
      const colors = ['rgb(75, 192, 192)', 'rgb(255, 99, 132)', 'rgb(54, 162, 235)'];
      return {
        label: price.cropName,
        data: generateHistoricalData(price.price),
        borderColor: colors[index],
        backgroundColor: colors[index] + '20',
        tension: 0.4,
      };
    }),
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: t('market.priceChart'),
      },
    },
    scales: {
      y: {
        beginAtZero: false,
        ticks: {
          callback: function(value: any) {
            return 'रु ' + value;
          }
        }
      }
    }
  };

  // Bar chart for price comparison
  const priceComparisonData = {
    labels: filteredPrices.map(p => p.cropName),
    datasets: [
      {
        label: 'मूल्य (रुपैयाँ)',
        data: filteredPrices.map(p => p.price),
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
        borderColor: 'rgba(34, 197, 94, 1)',
        borderWidth: 1,
      },
    ],
  };

  const barChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: t('market.priceComparison'),
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value: any) {
            return 'रु ' + value;
          }
        }
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">{t('market.title')}</h1>
        <p className="text-gray-600">
          {t('market.subtitle')}
        </p>
      </div>

      {/* Filters */}
      <div className="card p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('market.selectLocation')}
            </label>
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="input-field"
            >
              {locations.map(location => (
                <option key={location} value={location}>{location}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('market.selectCrop')}
            </label>
            <select
              value={selectedCrop}
              onChange={(e) => setSelectedCrop(e.target.value)}
              className="input-field"
            >
              {crops.map(crop => (
                <option key={crop} value={crop}>{crop}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Current Prices Table */}
      <div className="card p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('market.todayPrices')}</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('market.crop')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('market.price')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('market.unit')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('market.location')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('market.updateDate')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('market.trend')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPrices.map((price) => {
                // Mock trend calculation
                const trendUp = Math.random() > 0.5;
                const trendPercent = (Math.random() * 10 + 1).toFixed(1);
                
                return (
                  <tr key={price.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{price.cropName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-lg font-semibold text-green-600">
                        रु {price.price.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                      {price.unit}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-gray-600">
                        <MapPin className="h-4 w-4 mr-1" />
                        {price.location}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-gray-600">
                        <Calendar className="h-4 w-4 mr-1" />
                        {price.updatedAt.toLocaleDateString('ne-NP')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`flex items-center ${trendUp ? 'text-green-600' : 'text-red-600'}`}>
                        {trendUp ? 
                          <TrendingUp className="h-4 w-4 mr-1" /> : 
                          <TrendingDown className="h-4 w-4 mr-1" />
                        }
                        {trendPercent}%
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredPrices.length === 0 && (
          <div className="text-center py-12">
            <TrendingUp className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('market.noData')}</h3>
            <p className="text-gray-600">{t('market.noDataMessage')}</p>
          </div>
        )}
      </div>

      {/* Charts */}
      {filteredPrices.length > 0 && (
        <>
          <div className="card p-6">
            <Line data={priceChartData} options={chartOptions} />
          </div>

          <div className="card p-6">
            <Bar data={priceComparisonData} options={barChartOptions} />
          </div>
        </>
      )}

      {/* Market Tips */}
      <div className="card p-6 bg-blue-50 border-blue-200">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">{t('market.marketTips')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
          <div>
            <h4 className="font-medium mb-2">{t('market.bestSellTime')}</h4>
            <ul className="space-y-1">
              <li>{t('market.sellTip1')}</li>
              <li>{t('market.sellTip2')}</li>
              <li>{t('market.sellTip3')}</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-2">{t('market.bestBuyTime')}</h4>
            <ul className="space-y-1">
              <li>{t('market.buyTip1')}</li>
              <li>{t('market.buyTip2')}</li>
              <li>{t('market.buyTip3')}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketDashboard;