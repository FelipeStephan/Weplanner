import { useState } from "react";
import { clientsRepository } from "../../repositories/clientsRepository";
import { CLIENTS_DEMO_SEED } from "../../demo/clientsDemoData";

export function useClientsData() {
  const [clientsList, setClientsList] = useState(() =>
    clientsRepository.listAll(CLIENTS_DEMO_SEED),
  );

  const refreshClients = () => {
    setClientsList(clientsRepository.listAll(CLIENTS_DEMO_SEED));
  };

  return { clientsList, refreshClients };
}
