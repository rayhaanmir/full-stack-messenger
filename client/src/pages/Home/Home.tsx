import "./Home.css";

interface HomeProps {
  userId: string;
}

const Home = ({ userId }: HomeProps) => {
  return (
    <div>
      <h1>Welcome, {userId}!</h1>
    </div>
  );
};

export default Home;
