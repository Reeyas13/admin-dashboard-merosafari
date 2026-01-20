






import Logo from "src/assets/images/logos/dark-logo.svg";
// import Logowhite from "src/assets/images/logos/light-logo.svg";


const FullLogo = () => {
  return (


    <>
      {/* Dark Logo   */}
      {/* <img src={Logo} alt="logo" className="block dark:hidden h-[150px]" /> */}
      {/* Light Logo  */}
      <img src={Logo} alt="logo" className="h-[100px] w-[100px]" />
    </>
  );
};

export default FullLogo;
