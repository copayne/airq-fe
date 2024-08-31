import dynamic from 'next/dynamic';

const ApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

const generateData = (num, options) => {
  const data = [];
  let n = 0;
  while (n <= num) {
    data.push(Math.floor(Math.random() * options.max));
    n++;
  }

  return data;
}

export const formatHeatmapData = (sensors, readings) => {
  const series = [];

  // TODO: probably can be more efficient splitting/sorting readings by sensor
  sensors.forEach(sensor => {
    let sensorReadings = readings.filter(reading => reading?.co2Reading?.co2Ppm && reading.sensor.id === sensor.id);

    // trim to last 50 readings
    // TODO: fetch by date
    sensorReadings = sensorReadings.splice(0, 34);

    series.push({
      name: sensor.name,
      data: sensorReadings.map(r => r?.co2Reading?.co2Ppm),
    });
  });

  return series;
}

const Heatmap = ({ series }) => {
  const options =  {
    chart: {
      height: 350,
      type: 'heatmap',
    },
    plotOptions: {
      heatmap: {
        shadeIntensity: 0.5,
        radius: 0,
        useFillColorAsStroke: true,
        colorScale: {
          ranges: [{
              from: 0,
              to: 400,
              name: 'pristine',
              color: '#323BBD'
            },
            {
              from: 401,
              to: 800,
              name: 'good',
              color: '#628b48'
            },
            {
              from: 801,
              to: 1000,
              name: 'elevated',
              color: '#fff12e'
            },
            {
              from: 1001,
              to: 5000,
              name: 'extreme',
              color: '#ff312e'
            }
          ]
        }
      }
    },
    dataLabels: {
      enabled: false
    },
    stroke: {
      width: 2
    },
    title: {
      text: 'co2 heatmap'
    },
  };

  return (
    <>
      <ApexChart
        options={options}
        series={series}
        type="heatmap"
        width={500}
      />
    </>
  )
}

export default Heatmap;
