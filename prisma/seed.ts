import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('admin123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      password: hashedPassword,
      displayName: 'Admin User',
      role: 'admin',
    },
  });
  console.log('Created admin user:', admin.email);

  const devices = await Promise.all([
    prisma.device.upsert({
      where: { id: 'device-1' },
      update: {},
      create: {
        id: 'device-1',
        name: 'Central Substation Monitor',
        status: 'online',
        grid: 'GRID-A',
        lat: 25.0421,
        lng: 121.5139,
        signalStrength: 85,
      },
    }),
    prisma.device.upsert({
      where: { id: 'device-2' },
      update: {},
      create: {
        id: 'device-2',
        name: 'North District Sensor',
        status: 'online',
        grid: 'GRID-B',
        lat: 25.0856,
        lng: 121.5221,
        signalStrength: 72,
      },
    }),
    prisma.device.upsert({
      where: { id: 'device-3' },
      update: {},
      create: {
        id: 'device-3',
        name: 'East Side Transformer',
        status: 'offline',
        grid: 'GRID-C',
        lat: 25.0321,
        lng: 121.5456,
        signalStrength: null,
      },
    }),
    prisma.device.upsert({
      where: { id: 'device-4' },
      update: {},
      create: {
        id: 'device-4',
        name: 'South District Monitor',
        status: 'online',
        grid: 'GRID-A',
        lat: 25.0123,
        lng: 121.5012,
        signalStrength: 91,
      },
    }),
  ]);
  console.log('Created devices:', devices.length);

  const events = await Promise.all([
    prisma.event.upsert({
      where: { id: 'event-1' },
      update: {},
      create: {
        id: 'event-1',
        status: 'Active',
        severity: 'High',
        location: 'Central District',
        grid: 'GRID-A',
        lat: 25.0421,
        lng: 121.5139,
        notes: 'Major power outage affecting commercial district',
        affectedCustomers: 1250,
        start: new Date('2026-04-19T00:30:00Z'),
      },
    }),
    prisma.event.upsert({
      where: { id: 'event-2' },
      update: {},
      create: {
        id: 'event-2',
        status: 'Active',
        severity: 'Medium',
        location: 'North Residential Area',
        grid: 'GRID-B',
        lat: 25.0856,
        lng: 121.5221,
        notes: 'Scheduled maintenance - voltage fluctuation',
        affectedCustomers: 340,
        start: new Date('2026-04-19T02:00:00Z'),
      },
    }),
    prisma.event.upsert({
      where: { id: 'event-3' },
      update: {},
      create: {
        id: 'event-3',
        status: 'Resolved',
        severity: 'Low',
        location: 'East Side',
        grid: 'GRID-C',
        lat: 25.0321,
        lng: 121.5456,
        notes: 'Minor fault cleared - power restored',
        affectedCustomers: 85,
        start: new Date('2026-04-18T18:15:00Z'),
        duration: '45min',
      },
    }),
  ]);
  console.log('Created events:', events.length);

  console.log('\nSeeding completed!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });