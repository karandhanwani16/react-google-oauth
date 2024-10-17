import useAuthStore from '@/store/useAuthStore';

const useAuthFacade = () => {
  const { user, token, isAuthenticated,setUser, login: storeLogin, logout: storeLogout, resetState} = useAuthStore();

  return {
    user,
    token,
    isAuthenticated,
    setUser,
    storeLogin,
    storeLogout,
    resetState
  };
};

export default useAuthFacade;
