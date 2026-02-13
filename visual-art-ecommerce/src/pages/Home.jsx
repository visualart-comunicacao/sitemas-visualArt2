import React, { useEffect, useMemo, useState } from "react";
import { Card, Typography, Empty } from "antd";
import { useNavigate, useLocation } from "react-router-dom";
import { loadCampaigns } from "../services/campaigns.storage";
import "./home-campaigns.css";

const { Title } = Typography;

function goByCampaign(navigate, c) {
  if (!c || c.linkType === "NONE") return;
  if (c.linkType === "URL" && c.linkValue) window.open(c.linkValue, "_blank");
  if (c.linkType === "PRODUCT" && c.linkValue) navigate(`/produto/${c.linkValue}`);
  if (c.linkType === "CATEGORY" && c.linkValue)
    navigate(`/produtos?categoria=${encodeURIComponent(c.linkValue)}`);
}

export default function HomePage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [campaigns, setCampaigns] = useState([]);

  const refresh = () => {
    const list = loadCampaigns();
    setCampaigns(Array.isArray(list) ? list : []);
  };

  useEffect(() => {
    // carrega ao entrar na home
    refresh();

    // sincroniza quando mudar localStorage (ex: outra aba)
    const onStorage = (e) => {
      if (e.key === "visualart:campaigns") refresh();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  useEffect(() => {
    // força recarregar toda vez que você navegar pra essa rota
    // (resolve quando o componente não remonta)
    refresh();
  }, [location.pathname]);

  const { hero, promos } = useMemo(() => {
    const active = (campaigns || []).filter((c) => c && c.active);

    const hero = active
      .filter((c) => c.type === "HERO")
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))[0];

    const promos = active
      .filter((c) => c.type === "PROMO")
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

      console.log({ hero, promos });
    return { hero, promos };
  }, [campaigns]);

  return (
    <div className="home">
      {hero?.imageUrl ? (
        <div
          className="home-hero"
          onClick={() => goByCampaign(navigate, hero)}
          role="button"
          tabIndex={0}
        >
          <img src={hero.imageUrl} alt={hero.title || "Campanha"} />
        </div>
      ) : null}

      {promos?.length ? (
        <>
          <Title level={4} style={{ marginTop: 16 }}>
            Promoções
          </Title>
          <div className="home-promos">
            {promos.map((p) => (
              <Card
                key={p.id}
                hoverable
                className="home-promoCard"
                onClick={() => goByCampaign(navigate, p)}
                cover={<img src={p.imageUrl} alt={p.title || "Promo"} className="home-promoImg" />}
              />
            ))}
          </div>
        </>
      ) : null}

      {/* DEBUG opcional (remova depois) */}
      {!hero?.imageUrl && !promos?.length ? (
        <div style={{ marginTop: 24 }}>
          <Empty description="Nenhuma campanha ativa encontrada." />
        </div>
      ) : null}
    </div>
  );
}
