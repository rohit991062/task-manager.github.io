const ProjectInfo = ({ name, admin }) => {
  return (
    <div className="project-info">
      <h1>{name}</h1>
      <div className="project-participants">
        <span></span>
        <span></span>
        <span></span>
        <button className="project-participants__add">Add Participant</button>
        <p>Admin: {admin}</p>
      </div>
    </div>
  );
};

export default ProjectInfo;
