import Link from 'next/link';
import Image from 'next/image';
import { IVideo } from '@/models/Video';

interface VideoComponentProps {
  video: IVideo;
  onDelete: (id: string) => void;
}

export default function VideoComponent({
  video,
  onDelete,
}: VideoComponentProps) {
  const id = video?._id?.toString();

  const deleteVideo = async () => {
    await onDelete(id as string);
  };

  return (
    <div className='card bg-base-100 shadow-sm w-full'>
      <figure className='relative aspect-video'>
        <Image
          src={video.thumbnailUrl}
          alt={video.title}
          fill
          className='rounded-t-md object-cover'
        />
      </figure>
      <div className='card-body p-3'>
        <h2 className='card-title text-md'>{video.title}</h2>
        <p className='text-sm text-base-content/70 line-clamp-2'>
          {video.description}
        </p>
        <div className='card-actions justify-end mt-2'>
          <Link href={`/video/${video._id}`}>
            <button className='btn btn-primary'>Watch Now</button>
          </Link>
          <button className='btn btn-primary' onClick={deleteVideo}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
