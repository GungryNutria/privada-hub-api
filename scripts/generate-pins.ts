import * as fs from 'fs';
import * as bcrypt from 'bcrypt';

// Script para generar PINs iniciales y guardarlos en un archivo
async function generateInitialPins() {
  const pins: { lotNumber: number; pin: string }[] = [];
  
  for (let i = 1; i <= 300; i++) {
    const pin = Math.floor(1000 + Math.random() * 9000).toString();
    pins.push({ lotNumber: i, pin });
  }
  
  // Guardar en archivo CSV
  const csv = 'Lote,PIN\n' + pins.map(p => `${p.lotNumber},${p.pin}`).join('\n');
  fs.writeFileSync('pins-iniciales.csv', csv);
  
  console.log('✅ PINs generados y guardados en pins-iniciales.csv');
  console.log('\n📋 Primeros 10 PINs:');
  pins.slice(0, 10).forEach(p => {
    console.log(`  Casa ${p.lotNumber}: ${p.pin}`);
  });
  
  return pins;
}

generateInitialPins();