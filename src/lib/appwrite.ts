import 'server-only';
import {
  Client,
  Account,
  Users,
  Databases,
  Messaging,
  Query,
} from 'node-appwrite';
import { cookies } from 'next/headers';
import { AUTH_COOKIE } from '@/features/auth/constants';
import { v4 as uuidv4 } from 'uuid';
import { DATABASE_ID, TASKS_ID, MEMBERS_ID } from '@/config';
import cron from 'node-cron';
export async function createSessionClient() {
  const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT!);

  const session = await cookies().get(AUTH_COOKIE);

  if (!session || !session.value) {
    throw new Error('Unauthorized');
  }

  client.setSession(session.value);

  return {
    get account() {
      return new Account(client);
    },
    get databases() {
      return new Databases(client);
    },
  };
}

export async function createAdminClient() {
  const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT!)
    .setKey(process.env.NEXT_APPWRITE_KEY!);

  return {
    get account() {
      return new Account(client);
    },
    get users() {
      return new Users(client);
    },
    get databases() {
      return new Databases(client);
    },
    get messaging() {
      return new Messaging(client);
    },
  };
}

export async function notifyTasksDueSoon() {
  const { messaging, databases } = await createAdminClient();

  const now = new Date();
  const startOfTomorrow = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1,
    0,
    0,
    0,
    0,
  );
  const endOfTomorrow = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1,
    23,
    59,
    59,
    999,
  );

  // Lấy các task có dueDate là ngày mai
  const tasksDueSoon = await databases.listDocuments(DATABASE_ID, TASKS_ID, [
    Query.greaterThanEqual('dueDate', startOfTomorrow.toISOString()),
    Query.lessThanEqual('dueDate', endOfTomorrow.toISOString()),
  ]);
  // console.log('tasksDueSoon', tasksDueSoon);
  const allMembers = await databases.listDocuments(DATABASE_ID, MEMBERS_ID, []);

  const memberMap = allMembers.documents.reduce((map, member) => {
    map[member.$id] = member.userId;
    return map;
  }, {} as Record<string, string>);
  for (const task of tasksDueSoon.documents) {
    const memberId = task.assigneeId;
    const userId = memberMap[memberId];
    const dueDateString = task.dueDate;
    const dueDate = new Date(dueDateString);
    const taskName = task.name;
    const messageId = uuidv4();
    const scheduledAt = new Date(dueDate);
    scheduledAt.setDate(dueDate.getDate() - 1); // Lùi lại 1 ngày
    scheduledAt.setHours(16, 0, 0, 0); // Đặt giờ thành 16:00:00
    console.log('userId', userId);
    // Nếu thời gian hiện tại đã vượt qua thời gian gửi email, bỏ qua task này
    // const now = new Date();
    // if (scheduledAt <= now) {
    //   console.warn(
    //     `Thời gian gửi email (${scheduledAt.toISOString()}) đã qua cho task: ${taskName}`,
    //   );
    //   continue;
    // }

    await messaging.createEmail(
      messageId,
      `Nhiệm vụ "${taskName}" sắp đến hạn!`,
      `Xin chào,\n\nNhiệm vụ "${taskName}" của bạn sẽ đến hạn vào ${dueDate}. Vui lòng hoàn thành đúng hạn.`,
      [],
      [userId],
      [],
      [],
      [],
      [],
      false,
      true,
      null,
    );
  }
}
// notifyTasksDueSoon();

// Lập lịch chạy hàng ngày lúc 16:00
cron.schedule('0 2 * * *', async () => {
  console.log('Running notifyTasksDueSoon...');
  try {
    await notifyTasksDueSoon();
    console.log('Email notifications sent successfully!');
  } catch (error) {
    console.error('Failed to send notifications:', error);
  }
});
