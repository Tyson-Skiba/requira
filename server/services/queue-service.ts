import { dataTypes, prisma } from "./database";
import { downloadBook, downloadSong } from "./download-service";

const pause = () =>
  new Promise<void>((resolve) => {
    setTimeout(() => {
      resolve();
    }, 3000);
  });

export class QueueProvider {
  poll = async () => {
    const requests = await prisma.queue.findMany({
      where: {
        approver_user_id: {
          not: null,
        },
        attempts: {
          lte: 3,
        },
      },
      include: {
        request_user: true,
        approver_user: true,
      },
    });

    const updates = requests.map(async (request) => {
      console.log(`processing request ${request.id}`);
      if (request.type === dataTypes.music) await downloadSong(request);
      else if (request.type === dataTypes.book) await downloadBook(request);
    });

    await Promise.all(updates);

    await pause();
    this.poll();
  };
}
