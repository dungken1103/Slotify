import { useEffect, useState } from "react";
import { Label } from "./label";
import { Input } from "./input";
import { cn } from "../../lib/utils";

interface Province {
  code: number;
  name: string;
}

interface District {
  code: number;
  name: string;
  province_code: number;
}

interface Ward {
  code: number;
  name: string;
  district_code: number;
}

interface VnAddressSelectProps {
  cityValue?: string;
  addressValue?: string;
  onCityChange: (city: string) => void;
  onAddressChange: (address: string) => void;
  errorCity?: string;
  errorAddress?: string;
}

export function VnAddressSelect({
  cityValue,
  addressValue,
  onCityChange,
  onAddressChange,
  errorCity,
  errorAddress,
}: VnAddressSelectProps) {
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);

  const [selProv, setSelProv] = useState<number | "">("");
  const [selDist, setSelDist] = useState<number | "">("");
  const [selWard, setSelWard] = useState<number | "">("");
  const [street, setStreet] = useState<string>("");

  const [isInitializing, setIsInitializing] = useState(true);

  // 1. Fetch Provinces
  useEffect(() => {
    fetch("https://provinces.open-api.vn/api/p/")
      .then((res) => res.json())
      .then((data) => {
        setProvinces(data);
      })
      .catch((err) => console.error(err));
  }, []);

  // 2. Fetch Districts when Province changes
  useEffect(() => {
    if (selProv) {
      fetch(`https://provinces.open-api.vn/api/p/${selProv}?depth=2`)
        .then((res) => res.json())
        .then((data) => {
          setDistricts(data.districts || []);
        })
        .catch((err) => console.error(err));
    } else {
      setDistricts([]);
    }
  }, [selProv]);

  // 3. Fetch Wards when District changes
  useEffect(() => {
    if (selDist) {
      fetch(`https://provinces.open-api.vn/api/d/${selDist}?depth=2`)
        .then((res) => res.json())
        .then((data) => {
          setWards(data.wards || []);
        })
        .catch((err) => console.error(err));
    } else {
      setWards([]);
    }
  }, [selDist]);

  // 4. Handle initialization from props (when editing)
  useEffect(() => {
    if (!isInitializing) return;
    if (provinces.length === 0) return;

    if (cityValue || addressValue) {
      const pMatch = provinces.find((p) => p.name === cityValue);
      if (pMatch) {
        setSelProv(pMatch.code);
        // We defer district and ward setting to manual entry or complex parsing if needed.
        // For simplicity now, we just dump the existing address in street input if we can't parse it.
        const addrParts = (addressValue || "").split(",").map((s) => s.trim());
        setStreet(addrParts.length ? addrParts[0] : addressValue || "");
      } else {
        setStreet(addressValue || "");
      }
    }
    setIsInitializing(false);
  }, [provinces, cityValue, addressValue, isInitializing]);

  // 5. Update parent when selections change (ignore during initialization to prevent wiping data)
  useEffect(() => {
    if (isInitializing) return;

    const pName = provinces.find((p) => p.code === selProv)?.name || "";
    const dName = districts.find((d) => d.code === selDist)?.name || "";
    const wName = wards.find((w) => w.code === selWard)?.name || "";

    if (pName) {
      onCityChange(pName);
    }

    const parts = [street, wName, dName].filter(Boolean);
    if (parts.length > 0) {
      onAddressChange(parts.join(", "));
    } else {
      onAddressChange(street);
    }
  }, [selProv, selDist, selWard, street, isInitializing]);

  // Select styling class
  const selectClass =
    "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

  return (
    <div className="space-y-4 rounded-lg border border-border/50 bg-muted/20 p-4">
      <div className="space-y-2">
        <Label>Thành phố / Tỉnh</Label>
        <select
          value={selProv}
          onChange={(e) => {
            setSelProv(Number(e.target.value) || "");
            setSelDist("");
            setSelWard("");
          }}
          className={cn(selectClass, errorCity && "border-destructive text-destructive focus-visible:ring-destructive")}
        >
          <option value="">-- Chọn Tỉnh / Thành phố --</option>
          {provinces.map((p) => (
            <option key={p.code} value={p.code}>
              {p.name}
            </option>
          ))}
        </select>
        {errorCity && <p className="text-sm text-destructive">{errorCity}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Quận / Huyện</Label>
          <select
            value={selDist}
            onChange={(e) => {
              setSelDist(Number(e.target.value) || "");
              setSelWard("");
            }}
            disabled={!selProv}
            className={selectClass}
          >
            <option value="">-- Chọn Quận / Huyện --</option>
            {districts.map((d) => (
              <option key={d.code} value={d.code}>
                {d.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label>Phường / Xã</Label>
          <select
            value={selWard}
            onChange={(e) => setSelWard(Number(e.target.value) || "")}
            disabled={!selDist}
            className={selectClass}
          >
            <option value="">-- Chọn Phường / Xã --</option>
            {wards.map((w) => (
              <option key={w.code} value={w.code}>
                {w.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Số nhà, Tên đường</Label>
        <Input
          value={street}
          onChange={(e) => setStreet(e.target.value)}
          placeholder="Ví dụ: 72 Lê Thánh Tôn"
          className={cn(errorAddress && "border-destructive focus-visible:ring-destructive")}
        />
        {errorAddress && <p className="text-sm text-destructive">{errorAddress}</p>}
      </div>
      
      {/* Read-only preview string */}
      {(selProv || street) && (
          <p className="text-xs text-muted-foreground mt-2 italic">
            Địa chỉ xem trước: {[street, wards.find(w=>w.code===selWard)?.name, districts.find(d=>d.code===selDist)?.name, provinces.find(p=>p.code===selProv)?.name].filter(Boolean).join(", ")}
          </p>
      )}
    </div>
  );
}
