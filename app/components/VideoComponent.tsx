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
    <div className='card bg-base-100 image-full w-full shadow-sm'>
      {' '}
      {/* ✅ Set width to full */}
      <figure>
        <Image
          src={video.thumbnailUrl}
          alt={video.title}
          width={500}
          height={300}
          className='rounded-md'
        />
      </figure>
      <div className='card-body'>
        <h2 className='card-title'>{video.title}</h2>
        <p>{video.description}</p>
        <div className='card-actions justify-end'>
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
