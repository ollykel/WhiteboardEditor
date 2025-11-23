interface AboutUsInfoCardProps {
  name: string;
  imgSrc: string;
  linkedInImgSrc: string;
  linkedInLink: string;
  gitHubImgSrc: string;
  gitHubLink: string;
}

const AboutUsInfoCard = ({
  name,
  imgSrc,
  linkedInImgSrc,
  linkedInLink,
  gitHubImgSrc,
  gitHubLink,
}: AboutUsInfoCardProps) => {
  return (
    <div className="flex flex-col md:flex-row">
      <img 
        src={imgSrc} 
        alt={`${name}'s Photo`}
        width={240}
        height={240}
        className="rounded-full shadow-2xl m-4"
      />
      <div className="flex flex-col justify-center pb-12 mx-2">
        <h3 className="text-center font-bold text-2xl p-4">{name}</h3>
        <div className="flex flex-col xl:flex-row items-center">
          <a href={linkedInLink} target="_blank">
            <div className="flex gap-2 m-2 items-center">
              <img 
                src={linkedInImgSrc} 
                alt={`${name}'s LinkedIn`} 
                width={50}
                height={50}
                className="shadow-2xl"
              />
              <p className="font-bold">LinkedIn</p>
            </div>
          </a>
          <a href={gitHubLink} target="_blank">
            <div className="flex gap-2 m-2 items-center">
              <img 
                src={gitHubImgSrc} 
                alt={`${name}'s GitHub`} 
                width={50}
                height={50}
                className="shadow-2xl"
              />
              <p className="font-bold">GitHub</p>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}

export default AboutUsInfoCard;