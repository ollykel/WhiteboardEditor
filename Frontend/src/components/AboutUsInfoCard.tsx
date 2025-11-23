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
    <div className="flex">
      <img src={imgSrc} alt={`${name}'s Photo`} />
      <div className="flex flex-col">
        <h3>{name}</h3>
        <div className="flex">
          <a href={linkedInLink} target="_blank">
            <img src={linkedInImgSrc} alt={`${name}'s LinkedIn`} />
            LinkedIn
          </a>
          <a href={gitHubLink} target="_blank">
            <img src={gitHubImgSrc} alt={`${name}'s GitHub`} />
            GitHub
          </a>
        </div>
      </div>
    </div>
  );
}

export default AboutUsInfoCard;