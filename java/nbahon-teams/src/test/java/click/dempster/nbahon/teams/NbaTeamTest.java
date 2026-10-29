package click.dempster.nbahon.teams;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;

import java.util.Arrays;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

import static org.junit.jupiter.api.Assertions.*;

class NbaTeamTest {

    @Test
    void shouldHaveExactlyThirtyActiveFranchises() {
        assertEquals(30, NbaTeam.values().length);

        long easternCount = Arrays.stream(NbaTeam.values()).filter(NbaTeam::isEasternConference).count();
        long westernCount = Arrays.stream(NbaTeam.values()).filter(NbaTeam::isWesternConference).count();

        assertEquals(15, easternCount, "Eastern Conference must contain 15 teams");
        assertEquals(15, westernCount, "Western Conference must contain 15 teams");
    }

    @Test
    void allTeamsMustHaveValidCanonicalProperties() {
        Set<String> abbreviations = Arrays.stream(NbaTeam.values())
                .map(NbaTeam::abbreviation)
                .collect(Collectors.toSet());
        assertEquals(30, abbreviations.size(), "All 30 team abbreviations must be unique");

        for (NbaTeam team : NbaTeam.values()) {
            assertNotNull(team.abbreviation());
            assertEquals(3, team.abbreviation().length());
            assertEquals(team.abbreviation().toUpperCase(), team.abbreviation());

            assertNotNull(team.fullName());
            assertFalse(team.fullName().isBlank());

            assertNotNull(team.city());
            assertFalse(team.city().isBlank());

            assertNotNull(team.nickname());
            assertFalse(team.nickname().isBlank());

            assertNotNull(team.conference());
            assertTrue(team.isEasternConference() || team.isWesternConference());
        }
    }

    @ParameterizedTest
    @CsvSource({
            "PHO, PHX",
            "BRK, BKN",
            "NJN, BKN",
            "CHH, CHA",
            "CHO, CHA",
            "OKT, OKC",
            "SEA, OKC",
            "NOH, NOP",
            "NOK, NOP",
            "NO, NOP",
            "GS, GSW",
            "NY, NYK",
            "SA, SAS",
            "UTAH, UTA",
            "UTH, UTA",
            "WSH, WAS",
            "VAN, MEM"
    })
    void shouldResolveCodeAliases(String alias, String expectedCanonicalCode) {
        Optional<NbaTeam> team = NbaTeam.fromCode(alias);
        assertTrue(team.isPresent(), "Expected code alias to be resolved: " + alias);
        assertEquals(expectedCanonicalCode, team.get().abbreviation());
    }

    @ParameterizedTest
    @CsvSource({
            "'L.A. Clippers', LAC",
            "'LA Clippers', LAC",
            "'Clippers', LAC",
            "'L.A. Lakers', LAL",
            "'LA Lakers', LAL",
            "'Lakers', LAL",
            "'Chicago', CHI",
            "'Chicago Bulls', CHI",
            "'Bulls', CHI",
            "'Sixers', PHI",
            "'76ers', PHI",
            "'Blazers', POR",
            "'Trail Blazers', POR",
            "'Wolves', MIN",
            "'Timberwolves', MIN",
            "'Cavs', CLE",
            "'Mavs', DAL",
            "'San Francisco', GSW"
    })
    void shouldResolveNameAliases(String nameOrAlias, String expectedCanonicalCode) {
        Optional<NbaTeam> team = NbaTeam.fromName(nameOrAlias);
        assertTrue(team.isPresent(), "Expected name alias to be resolved: " + nameOrAlias);
        assertEquals(expectedCanonicalCode, team.get().abbreviation());
    }

    @Test
    void ambiguousCitiesAloneMustNotResolveToAvoidMisattribution() {
        // Los Angeles and New York host two franchises and must not resolve without nickname/code
        assertTrue(NbaTeam.fromName("Los Angeles").isEmpty(), "Ambiguous city 'Los Angeles' must not resolve");
        assertTrue(NbaTeam.fromName("New York").isEmpty(), "Ambiguous city 'New York' must not resolve");
    }

    @ParameterizedTest
    @CsvSource({
            "CHI, Chicago, CHI",
            "LAC, 'L.A. Clippers', LAC",
            "LAL, 'L.A. Lakers', LAL",
            "PHO, Phoenix, PHX",
            "CHH, Charlotte, CHA",
            "BRK, Brooklyn, BKN",
            "OKT, 'Oklahoma City', OKC",
            "'', 'Chicago Bulls', CHI",
            "BOS, '', BOS"
    })
    void shouldResolveCombinedInputs(String rawCode, String rawName, String expectedCanonicalCode) {
        NbaTeam team = NbaTeam.resolveOrThrow(rawCode, rawName);
        assertEquals(expectedCanonicalCode, team.abbreviation());
    }

    @Test
    void shouldThrowForUnknownInputs() {
        assertThrows(IllegalArgumentException.class, () -> NbaTeam.resolveOrThrow("UNKNOWN", "Invalid"));
        assertThrows(IllegalArgumentException.class, () -> NbaTeam.resolveOrThrow(null, null));
    }
}
