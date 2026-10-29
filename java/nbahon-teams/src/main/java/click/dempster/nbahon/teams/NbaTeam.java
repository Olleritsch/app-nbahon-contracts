package click.dempster.nbahon.teams;

import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;

/**
 * Kanonische Repräsentation der 30 aktiven NBA-Franchises im nbahon-Ökosystem.
 * Definiert offizielle Kürzel (TLA), vollständige Namen, Stadt/Region, Nicknames und Konferenzen
 * sowie deterministische Resolver zur Bereinigung von Zulieferer-Dialekten (z. B. NatStat, ESPN).
 */
public enum NbaTeam {

    ATL("ATL", "Atlanta Hawks", "Atlanta", "Hawks", "Eastern",
            Set.of(),
            Set.of("Hawks")),

    BOS("BOS", "Boston Celtics", "Boston", "Celtics", "Eastern",
            Set.of(),
            Set.of("Celtics")),

    BKN("BKN", "Brooklyn Nets", "Brooklyn", "Nets", "Eastern",
            Set.of("BRK", "NJN"),
            Set.of("Nets", "New Jersey Nets")),

    CHA("CHA", "Charlotte Hornets", "Charlotte", "Hornets", "Eastern",
            Set.of("CHH", "CHO"),
            Set.of("Hornets", "Charlotte Bobcats")),

    CHI("CHI", "Chicago Bulls", "Chicago", "Bulls", "Eastern",
            Set.of(),
            Set.of("Bulls")),

    CLE("CLE", "Cleveland Cavaliers", "Cleveland", "Cavaliers", "Eastern",
            Set.of(),
            Set.of("Cavaliers", "Cavs")),

    DAL("DAL", "Dallas Mavericks", "Dallas", "Mavericks", "Western",
            Set.of(),
            Set.of("Mavericks", "Mavs")),

    DEN("DEN", "Denver Nuggets", "Denver", "Nuggets", "Western",
            Set.of(),
            Set.of("Nuggets")),

    DET("DET", "Detroit Pistons", "Detroit", "Pistons", "Eastern",
            Set.of(),
            Set.of("Pistons")),

    GSW("GSW", "Golden State Warriors", "Golden State", "Warriors", "Western",
            Set.of("GS"),
            Set.of("Warriors", "San Francisco")),

    HOU("HOU", "Houston Rockets", "Houston", "Rockets", "Western",
            Set.of(),
            Set.of("Rockets")),

    IND("IND", "Indiana Pacers", "Indiana", "Pacers", "Eastern",
            Set.of(),
            Set.of("Pacers", "Indianapolis")),

    LAC("LAC", "Los Angeles Clippers", "Los Angeles", "Clippers", "Western",
            Set.of(),
            Set.of("L.A. Clippers", "LA Clippers", "Clippers")),

    LAL("LAL", "Los Angeles Lakers", "Los Angeles", "Lakers", "Western",
            Set.of(),
            Set.of("L.A. Lakers", "LA Lakers", "Lakers")),

    MEM("MEM", "Memphis Grizzlies", "Memphis", "Grizzlies", "Western",
            Set.of("VAN"),
            Set.of("Grizzlies", "Vancouver Grizzlies")),

    MIA("MIA", "Miami Heat", "Miami", "Heat", "Eastern",
            Set.of(),
            Set.of("Heat")),

    MIL("MIL", "Milwaukee Bucks", "Milwaukee", "Bucks", "Eastern",
            Set.of(),
            Set.of("Bucks")),

    MIN("MIN", "Minnesota Timberwolves", "Minnesota", "Timberwolves", "Western",
            Set.of(),
            Set.of("Timberwolves", "Wolves", "Minneapolis")),

    NOP("NOP", "New Orleans Pelicans", "New Orleans", "Pelicans", "Western",
            Set.of("NOH", "NOK", "NO"),
            Set.of("Pelicans", "New Orleans Hornets")),

    NYK("NYK", "New York Knicks", "New York", "Knicks", "Eastern",
            Set.of("NY"),
            Set.of("Knicks", "NY Knicks", "Knickerbockers")),

    OKC("OKC", "Oklahoma City Thunder", "Oklahoma City", "Thunder", "Western",
            Set.of("OKT", "SEA"),
            Set.of("Thunder", "Seattle SuperSonics", "Sonics")),

    ORL("ORL", "Orlando Magic", "Orlando", "Magic", "Eastern",
            Set.of(),
            Set.of("Magic")),

    PHI("PHI", "Philadelphia 76ers", "Philadelphia", "76ers", "Eastern",
            Set.of(),
            Set.of("76ers", "Sixers", "Philly")),

    PHX("PHX", "Phoenix Suns", "Phoenix", "Suns", "Western",
            Set.of("PHO"),
            Set.of("Suns")),

    POR("POR", "Portland Trail Blazers", "Portland", "Trail Blazers", "Western",
            Set.of(),
            Set.of("Trail Blazers", "Portland Trailblazers", "Blazers")),

    SAC("SAC", "Sacramento Kings", "Sacramento", "Kings", "Western",
            Set.of(),
            Set.of("Kings")),

    SAS("SAS", "San Antonio Spurs", "San Antonio", "Spurs", "Western",
            Set.of("SA"),
            Set.of("Spurs")),

    TOR("TOR", "Toronto Raptors", "Toronto", "Raptors", "Eastern",
            Set.of(),
            Set.of("Raptors")),

    UTA("UTA", "Utah Jazz", "Utah", "Jazz", "Western",
            Set.of("UTAH", "UTH"),
            Set.of("Jazz", "Salt Lake City")),

    WAS("WAS", "Washington Wizards", "Washington", "Wizards", "Eastern",
            Set.of("WSH"),
            Set.of("Wizards"));

    private final String abbreviation;
    private final String fullName;
    private final String city;
    private final String nickname;
    private final String conference;
    private final Set<String> codeAliases;
    private final Set<String> nameAliases;

    private static final Map<String, NbaTeam> CODE_INDEX;
    private static final Map<String, NbaTeam> NAME_INDEX;

    static {
        Map<String, NbaTeam> codes = new HashMap<>();
        Map<String, NbaTeam> names = new HashMap<>();

        for (NbaTeam team : values()) {
            codes.put(normalize(team.abbreviation), team);
            for (String codeAlias : team.codeAliases) {
                codes.put(normalize(codeAlias), team);
            }

            names.put(normalize(team.fullName), team);
            names.put(normalize(team.nickname), team);
            for (String nameAlias : team.nameAliases) {
                names.put(normalize(nameAlias), team);
            }

            // Eindeutige Städte/Regionen (alle außer Los Angeles und New York, die zwei Franchises beherbergen)
            if (!"Los Angeles".equalsIgnoreCase(team.city) && !"New York".equalsIgnoreCase(team.city)) {
                names.put(normalize(team.city), team);
            }
        }

        CODE_INDEX = Collections.unmodifiableMap(codes);
        NAME_INDEX = Collections.unmodifiableMap(names);
    }

    NbaTeam(String abbreviation, String fullName, String city, String nickname, String conference,
            Set<String> codeAliases, Set<String> nameAliases) {
        this.abbreviation = abbreviation;
        this.fullName = fullName;
        this.city = city;
        this.nickname = nickname;
        this.conference = conference;
        this.codeAliases = codeAliases != null ? codeAliases : Set.of();
        this.nameAliases = nameAliases != null ? nameAliases : Set.of();
    }

    public String abbreviation() {
        return abbreviation;
    }

    public String fullName() {
        return fullName;
    }

    public String city() {
        return city;
    }

    public String nickname() {
        return nickname;
    }

    public String conference() {
        return conference;
    }

    public boolean isEasternConference() {
        return "Eastern".equalsIgnoreCase(conference);
    }

    public boolean isWesternConference() {
        return "Western".equalsIgnoreCase(conference);
    }

    public Set<String> codeAliases() {
        return codeAliases;
    }

    public Set<String> nameAliases() {
        return nameAliases;
    }

    /**
     * Ermittelt ein Team anhand seines 3-Buchstaben-Kürzels oder bekannter Aliase (z. B. "PHO" -> PHX, "BRK" -> BKN).
     */
    public static Optional<NbaTeam> fromCode(String rawCode) {
        if (rawCode == null || rawCode.isBlank()) {
            return Optional.empty();
        }
        return Optional.ofNullable(CODE_INDEX.get(normalize(rawCode)));
    }

    /**
     * Ermittelt ein Team anhand seines Namens, Kurznamens oder Nicknames (z. B. "L.A. Clippers" -> LAC, "Bulls" -> CHI).
     * Mehrdeutige Städtenamen ("Los Angeles", "New York") liefern absichtlich empty, da zwei Teams infrage kommen.
     */
    public static Optional<NbaTeam> fromName(String rawName) {
        if (rawName == null || rawName.isBlank()) {
            return Optional.empty();
        }
        String normalized = normalize(rawName);
        NbaTeam exact = NAME_INDEX.get(normalized);
        if (exact != null) {
            return Optional.of(exact);
        }

        // Substring-Fallback nur für Nicknames (z. B. "Chicago Bulls (Home)" -> CHI)
        for (NbaTeam team : values()) {
            if (normalized.contains(normalize(team.fullName)) || normalized.contains(normalize(team.nickname))) {
                return Optional.of(team);
            }
        }

        return Optional.empty();
    }

    /**
     * Kombinierter Resolver: Löst primär über das Kürzel auf (da am zuverlässigsten) und
     * nutzt den Namen als Fallback bzw. zur Disambiguierung.
     */
    public static Optional<NbaTeam> resolve(String rawCode, String rawName) {
        Optional<NbaTeam> byCode = fromCode(rawCode);
        if (byCode.isPresent()) {
            return byCode;
        }
        return fromName(rawName);
    }

    /**
     * Löst das Team auf oder wirft eine IllegalArgumentException mit klaren Kontextinformationen.
     */
    public static NbaTeam resolveOrThrow(String rawCode, String rawName) {
        return resolve(rawCode, rawName).orElseThrow(() ->
                new IllegalArgumentException(String.format(
                        "Unable to resolve canonical NBA team for code='%s', name='%s'",
                        rawCode, rawName)));
    }

    private static String normalize(String input) {
        if (input == null) {
            return "";
        }
        return input.trim()
                .toLowerCase(Locale.ROOT)
                .replaceAll("[.,'-]", "")
                .replaceAll("\\s+", " ");
    }
}
