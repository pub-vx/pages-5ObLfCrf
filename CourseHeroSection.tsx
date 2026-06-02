interface CourseHeroSectionProps {
  images: string[];
  courseName: string;
}

export function CourseHeroSection({ images, courseName }: CourseHeroSectionProps) {
  return (
    <div className="relative">
      <img
        src={images[0]}
        alt={courseName}
        className="w-full h-56 object-cover"
      />
      {images.length > 1 && (
        <button className="absolute bottom-3 right-3 bg-black/60 text-white text-xs font-medium px-3 py-1.5 rounded-md">
          + 이미지 모두보기
        </button>
      )}
    </div>
  );
}
