import React from "react"
import AddressShortcut from "./AddressShortcut"
import StatusBadge, { BADGE_STATUS } from "./StatusBadge"
import { DataTable, Column } from "./DataTable"
import Tile from "./Tile"
import ViewAddressInBlockExplorer from "./ViewAddressInBlockExplorer"

const AuthorizationHistory = ({ contracts }) => {
  return (
    <Tile title="Authorization History">
      <DataTable data={contracts || []} itemFieldId="contractAddress">
        <Column
          header="contract address"
          field="contractAddress"
          renderContent={({ contractAddress }) => (
            <AddressShortcut address={contractAddress} />
          )}
        />
        <Column
          header="status"
          field="status"
          renderContent={({ status }) => (
            <StatusBadge
              className="self-start"
              status={BADGE_STATUS.COMPLETE}
              text="authorized"
            />
          )}
        />
        <Column
          header="contract details"
          field="details"
          renderContent={({ contractAddress }) => (
            <ViewAddressInBlockExplorer address={contractAddress} />
          )}
        />
      </DataTable>
    </Tile>
  )
}

export default AuthorizationHistory
