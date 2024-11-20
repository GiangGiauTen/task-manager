// import { Client, Databases, Messaging, Query } from 'node-appwrite';
// import { uuidv4 } from 'uuid';
// // This Appwrite function will be executed every time your function is triggered
// module.exports = async function name(req, res, log, error) {
//   // You can use the Appwrite SDK to interact with other services
//   // For this example, we're using the Users service
//   const client = new Client()
//     .setEndpoint(process.env.APPWRITE_FUNCTION_API_ENDPOINT)
//     .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT)
//     .setKey(req.headers['x-appwrite-key'] ?? '');

//   const databases = new Databases(client);
//   const messaging = new Messaging(client);

//   const oneDayFromNow = new Date();
//   oneDayFromNow.setDate(oneDayFromNow.getDate() + 1);
//   try {
//     // Lấy tất cả các task sắp đến hạn
//     const tasksDueSoon = await databases.listDocuments(DATABASE_ID, TASKS_ID, [
//       Query.lessThan('dueDate', oneDayFromNow.toISOString()),
//     ]);

//     // Lấy danh sách tất cả members
//     const allMembers = await databases.listDocuments(
//       DATABASE_ID,
//       MEMBERS_ID,
//       [],
//     );

//     // Tạo map userId từ memberId
//     const memberMap = allMembers.documents.reduce((map, member) => {
//       map[member.$id] = member.userId;
//       return map;
//     }, {});

//     for (const task of tasksDueSoon.documents) {
//       const memberId = task.assigneeId;
//       const userId = memberMap[memberId];
//       const dueDateString = task.dueDate;
//       const dueDate = new Date(dueDateString);
//       const taskName = task.name;
//       const messageId = uuidv4();

//       // Thời gian gửi email
//       const scheduledAt = new Date(dueDate);
//       scheduledAt.setDate(dueDate.getDate() - 1); // Lùi lại 1 ngày
//       scheduledAt.setHours(16, 0, 0, 0); // Đặt giờ gửi là 16:00

//       // Kiểm tra nếu thời gian gửi đã qua
//       const now = new Date();
//       if (scheduledAt <= now) {
//         console.warn(
//           `Thời gian gửi email (${scheduledAt.toISOString()}) đã qua cho task: ${taskName}`,
//         );
//         continue;
//       }

//       // Gửi email thông báo
//       await messaging.createEmail(
//         messageId,
//         `Nhiệm vụ "${taskName}" sắp đến hạn!`,
//         `Xin chào,\n\nNhiệm vụ "${taskName}" của bạn sẽ đến hạn vào ${dueDate.toLocaleString()}. Vui lòng hoàn thành đúng hạn.`,
//         [],
//         [userId],
//         [],
//         [],
//         [],
//         [],
//         false,
//         true,
//         null,
//       );
//     }

//     res.json({
//       status: 'success',
//       message: 'Notifications scheduled successfully.',
//       data: notifications,
//     });
//   } catch (error) {
//     console.error('Lỗi khi gửi thông báo:', error);
//     res.json({
//       status: 'error',
//       message: 'Failed to schedule notifications.',
//       error: error.message,
//     });
//   }
// };
