import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Interface đại diện cho Room trên Firestore
 */
interface SeedRoom {
  name: string;
  building: 'A' | 'B' | 'C' | 'V';
  floor: number;
  capacity: number;
  equipment: ('Projector' | 'Whiteboard' | 'High-spec PC' | 'AC')[];
  photoUrl: string;
  status: 'available' | 'occupied';
}

/**
 * Danh sách 20 phòng học & phòng lab mẫu tại trường VKU
 * Phân bổ đồng đều 4 tòa nhà (A, B, C, V), sức chứa từ 2 đến 20 chỗ
 */
const SAMPLE_ROOMS: Record<string, SeedRoom> = {
  // === TÒA A ===
  'phong-a101': {
    name: 'Phòng A.101',
    building: 'A',
    floor: 1,
    capacity: 4,
    equipment: ['Whiteboard', 'AC'],
    photoUrl: 'https://picsum.photos/seed/phong-a101/400/300',
    status: 'available',
  },
  'phong-a102': {
    name: 'Phòng A.102',
    building: 'A',
    floor: 1,
    capacity: 6,
    equipment: ['Projector', 'Whiteboard', 'AC'],
    photoUrl: 'https://picsum.photos/seed/phong-a102/400/300',
    status: 'available',
  },
  'phong-a201': {
    name: 'Phòng A.201',
    building: 'A',
    floor: 2,
    capacity: 8,
    equipment: ['Projector', 'Whiteboard', 'AC'],
    photoUrl: 'https://picsum.photos/seed/phong-a201/400/300',
    status: 'available',
  },
  'phong-a202': {
    name: 'Phòng A.202',
    building: 'A',
    floor: 2,
    capacity: 12,
    equipment: ['Projector', 'Whiteboard', 'High-spec PC', 'AC'],
    photoUrl: 'https://picsum.photos/seed/phong-a202/400/300',
    status: 'available',
  },
  'phong-a301': {
    name: 'Phòng A.301',
    building: 'A',
    floor: 3,
    capacity: 20,
    equipment: ['Projector', 'Whiteboard', 'AC'],
    photoUrl: 'https://picsum.photos/seed/phong-a301/400/300',
    status: 'available',
  },

  // === TÒA B ===
  'phong-b101': {
    name: 'Phòng B.101',
    building: 'B',
    floor: 1,
    capacity: 4,
    equipment: ['Whiteboard', 'AC'],
    photoUrl: 'https://picsum.photos/seed/phong-b101/400/300',
    status: 'available',
  },
  'phong-b102': {
    name: 'Phòng B.102',
    building: 'B',
    floor: 1,
    capacity: 6,
    equipment: ['Projector', 'AC'],
    photoUrl: 'https://picsum.photos/seed/phong-b102/400/300',
    status: 'available',
  },
  'phong-b201': {
    name: 'Phòng B.201',
    building: 'B',
    floor: 2,
    capacity: 10,
    equipment: ['Whiteboard', 'High-spec PC', 'AC'],
    photoUrl: 'https://picsum.photos/seed/phong-b201/400/300',
    status: 'available',
  },
  'phong-lab-b202': {
    name: 'Phòng Lab B.202',
    building: 'B',
    floor: 2,
    capacity: 16,
    equipment: ['Projector', 'Whiteboard', 'High-spec PC', 'AC'],
    photoUrl: 'https://picsum.photos/seed/phong-lab-b202/400/300',
    status: 'available',
  },
  'phong-b301': {
    name: 'Phòng B.301',
    building: 'B',
    floor: 3,
    capacity: 18,
    equipment: ['Projector', 'Whiteboard', 'AC'],
    photoUrl: 'https://picsum.photos/seed/phong-b301/400/300',
    status: 'available',
  },

  // === TÒA C ===
  'phong-c101': {
    name: 'Phòng C.101',
    building: 'C',
    floor: 1,
    capacity: 2,
    equipment: ['AC'],
    photoUrl: 'https://picsum.photos/seed/phong-c101/400/300',
    status: 'available',
  },
  'phong-c102': {
    name: 'Phòng C.102',
    building: 'C',
    floor: 1,
    capacity: 4,
    equipment: ['Whiteboard', 'AC'],
    photoUrl: 'https://picsum.photos/seed/phong-c102/400/300',
    status: 'available',
  },
  'phong-c201': {
    name: 'Phòng C.201',
    building: 'C',
    floor: 2,
    capacity: 8,
    equipment: ['Projector', 'Whiteboard', 'AC'],
    photoUrl: 'https://picsum.photos/seed/phong-c201/400/300',
    status: 'available',
  },
  'phong-c202': {
    name: 'Phòng C.202',
    building: 'C',
    floor: 2,
    capacity: 12,
    equipment: ['Projector', 'Whiteboard', 'High-spec PC', 'AC'],
    photoUrl: 'https://picsum.photos/seed/phong-c202/400/300',
    status: 'available',
  },
  'phong-c301': {
    name: 'Phòng C.301',
    building: 'C',
    floor: 3,
    capacity: 15,
    equipment: ['Projector', 'Whiteboard', 'AC'],
    photoUrl: 'https://picsum.photos/seed/phong-c301/400/300',
    status: 'available',
  },

  // === TÒA V (VIỆT - HÀN) ===
  'phong-v101': {
    name: 'Phòng V.101',
    building: 'V',
    floor: 1,
    capacity: 4,
    equipment: ['Whiteboard', 'AC'],
    photoUrl: 'https://picsum.photos/seed/phong-v101/400/300',
    status: 'available',
  },
  'phong-lab-v102': {
    name: 'Phòng Lab V.102',
    building: 'V',
    floor: 1,
    capacity: 8,
    equipment: ['Projector', 'High-spec PC', 'AC'],
    photoUrl: 'https://picsum.photos/seed/phong-lab-v102/400/300',
    status: 'available',
  },
  'phong-v201': {
    name: 'Phòng V.201',
    building: 'V',
    floor: 2,
    capacity: 10,
    equipment: ['Projector', 'Whiteboard', 'AC'],
    photoUrl: 'https://picsum.photos/seed/phong-v201/400/300',
    status: 'available',
  },
  'phong-lab-v202': {
    name: 'Phòng Lab V.202',
    building: 'V',
    floor: 2,
    capacity: 14,
    equipment: ['Projector', 'Whiteboard', 'High-spec PC', 'AC'],
    photoUrl: 'https://picsum.photos/seed/phong-lab-v202/400/300',
    status: 'available',
  },
  'phong-hoi-thao-v301': {
    name: 'Phòng Hội Thảo V.301',
    building: 'V',
    floor: 3,
    capacity: 20,
    equipment: ['Projector', 'Whiteboard', 'High-spec PC', 'AC'],
    photoUrl: 'https://picsum.photos/seed/phong-hoi-thao-v301/400/300',
    status: 'available',
  },
};

async function seedRooms() {
  console.log('🚀 [SeedRooms] Bắt đầu quá trình seed dữ liệu phòng vào Firestore...');

  // Tìm đường dẫn file Service Account Key
  const serviceAccountPath = path.resolve(process.cwd(), 'secrets/serviceAccountKey.json');

  if (!fs.existsSync(serviceAccountPath)) {
    console.error('❌ LỖI: Không tìm thấy file service account key tại:');
    console.error(`   ${serviceAccountPath}`);
    console.error('\n👉 Hướng dẫn tải file serviceAccountKey.json từ Firebase:');
    console.error('   1. Mở Firebase Console -> Project Settings (biểu tượng bánh răng).');
    console.error('   2. Chọn tab "Service accounts".');
    console.error('   3. Nhấn "Generate new private key" -> tải file JSON về.');
    console.error('   4. Đổi tên file thành "serviceAccountKey.json" và đặt vào thư mục "/secrets/" của dự án.');
    console.error('   5. Chạy lại lệnh: npx ts-node scripts/seedRooms.ts');
    process.exit(1);
  }

  // Khởi tạo Firebase Admin SDK với Service Account Key
  const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

  if (getApps().length === 0) {
    initializeApp({
      credential: cert(serviceAccount),
    });
  }

  const db = getFirestore();
  const roomsCollection = db.collection('rooms');

  let successCount = 0;
  const entries = Object.entries(SAMPLE_ROOMS);

  for (const [slug, roomData] of entries) {
    try {
      await roomsCollection.doc(slug).set(roomData, { merge: true });
      console.log(`  ✓ Đã seed: [${slug}] -> ${roomData.name} (Tòa ${roomData.building} - Tầng ${roomData.floor})`);
      successCount++;
    } catch (err: any) {
      console.error(`  ✗ Lỗi khi seed [${slug}]:`, err?.message || err);
    }
  }

  console.log(`\n🎉 [SeedRooms] Hoàn tất! Đã seed thành công ${successCount}/${entries.length} phòng vào Firestore collection "rooms".`);
}

seedRooms().catch(err => {
  console.error('❌ [SeedRooms] Lỗi nghiêm trọng:', err);
  process.exit(1);
});
